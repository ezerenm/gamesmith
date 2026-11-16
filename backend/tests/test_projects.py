"""Milestone 1 contract checks against isolated on-disk SQLite databases."""

from datetime import datetime
import os
from pathlib import Path
import subprocess
import sys

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import URL, create_engine, event, text
from sqlalchemy.orm import sessionmaker

from backend import crud, database, main


@pytest.fixture
def isolatedApp(tmp_path, monkeypatch):
    testEngine = create_engine(
        URL.create("sqlite", database=str(tmp_path / "projects.db")),
        connect_args={"check_same_thread": False},
    )
    event.listen(testEngine, "connect", database.enableForeignKeys)
    monkeypatch.setattr(database, "engine", testEngine)
    monkeypatch.setattr(main, "engine", testEngine)
    monkeypatch.setattr(database, "sessionFactory", sessionmaker(bind=testEngine))
    yield main.app
    testEngine.dispose()


@pytest.fixture
def client(isolatedApp):
    with TestClient(isolatedApp) as testClient:
        yield testClient


def testProjectLifecycle(client):
    assert client.get("/projects").json() == {"projects": []}
    originalIdea = "  Magic costs memories.\nWho pays?  "
    response = client.post("/projects", json={"original_idea": originalIdea})
    assert response.status_code == 201
    project = response.json()
    assert set(project) == {
        "id", "original_idea", "title", "premise", "genre", "tone", "setting",
        "current_scene_id", "created_at", "updated_at",
    }
    assert project["original_idea"] == originalIdea
    for field in ("title", "premise", "genre", "tone", "setting", "current_scene_id"):
        assert project[field] is None
    assert project["created_at"] == project["updated_at"]
    assert datetime.fromisoformat(project["created_at"]).utcoffset().total_seconds() == 0
    assert client.get("/projects").json() == {"projects": [project]}
    assert client.get(f"/projects/{project['id']}").json() == {
        "project": project, "characters": [], "scenes": [],
    }


@pytest.mark.parametrize("body", [
    {}, {"original_idea": ""}, {"original_idea": " \n\t "},
    {"original_idea": None}, {"original_idea": 123},
    {"original_idea": []}, {"original_idea": {}}, [], None,
    {"original_idea": "Idea", "title": "Must not be accepted"},
])
def testInvalidBodies(client, body):
    response = client.post("/projects", json=body)
    assert response.status_code == 400
    assert response.json() == {"error": "invalid_input", "message": "Please enter a game idea."}
    assert client.get("/projects").json() == {"projects": []}


@pytest.mark.parametrize("body", ["", "{", '{"original_idea":'])
def testMalformedJson(client, body):
    response = client.post("/projects", content=body, headers={"Content-Type": "application/json"})
    assert response.status_code == 400
    assert response.json()["error"] == "invalid_input"


def testMissingProject(client):
    response = client.get("/projects/999999")
    assert response.status_code == 404
    assert response.json() == {"error": "not_found", "message": "Project not found."}


@pytest.mark.parametrize("projectId", ["abc", "0", "-1"])
def testInvalidId(client, projectId):
    response = client.get(f"/projects/{projectId}")
    assert response.status_code == 400
    assert response.json()["error"] == "invalid_input"


def testHealthDocsAndCors(client):
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/docs").status_code == 200
    schema = client.get("/openapi.json").json()
    postResponses = schema["paths"]["/projects"]["post"]["responses"]
    assert "201" in postResponses and "400" in postResponses and "422" not in postResponses
    for origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
        response = client.options("/projects", headers={
            "Origin": origin, "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        })
        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == origin
    response = client.get("/health", headers={"Origin": "https://unapproved.example"})
    assert "access-control-allow-origin" not in response.headers


def testForeignKeysEnabled(client):
    with database.engine.connect() as connection:
        assert connection.execute(text("PRAGMA foreign_keys")).scalar() == 1


def testServerErrorsAreSafe(client, monkeypatch):
    def fail(session):
        raise RuntimeError("Private database details")

    monkeypatch.setattr(crud, "listProjects", fail)
    with TestClient(main.app, raise_server_exceptions=False) as safeClient:
        response = safeClient.get("/projects")
    assert response.status_code == 500
    assert response.json() == {
        "error": "internal_error", "message": "Something went wrong. Please try again.",
    }


def testNoGeminiCalls(client, monkeypatch):
    from google import genai

    def fail(*args, **kwargs):
        pytest.fail("Project CRUD must not construct a Gemini client")

    monkeypatch.setattr(genai, "Client", fail)
    assert client.post("/projects", json={"original_idea": "No AI needed"}).status_code == 201


def testPersistenceAcrossProcesses(tmp_path):
    repoRoot = Path(__file__).resolve().parents[2]
    environment = {**os.environ, "GAMESMITH_DB_PATH": str(tmp_path / "persistent.db")}
    createCode = '''
from fastapi.testclient import TestClient
from backend.main import app
with TestClient(app) as client:
    response = client.post('/projects', json={'original_idea': 'Saved across restarts'})
    assert response.status_code == 201
    assert response.json()['id'] == 1
'''
    reopenCode = '''
from fastapi.testclient import TestClient
from backend.main import app
with TestClient(app) as client:
    data = client.get('/projects/1').json()
    assert data['project']['original_idea'] == 'Saved across restarts'
    assert data['characters'] == [] and data['scenes'] == []
'''
    for code in (createCode, reopenCode):
        subprocess.run([sys.executable, "-c", code], cwd=repoRoot, env=environment, check=True)
