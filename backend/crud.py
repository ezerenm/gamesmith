from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Character, Project, utcTimestamp


def createProject(session: Session, originalIdea: str) -> Project:
    timestamp = utcTimestamp()
    project = Project(
        original_idea=originalIdea, created_at=timestamp, updated_at=timestamp
    )
    try:
        session.add(project)
        session.commit()
        session.refresh(project)
    except Exception:
        session.rollback()
        raise
    return project


def getProject(session: Session, projectId: int) -> Project | None:
    return session.get(Project, projectId)


def listProjects(session: Session) -> list[Project]:
    return list(session.scalars(select(Project).order_by(Project.id)))

def saveConcept(conceptDbSession: Session, targetProject: Project, conceptValues: dict) -> Project:
    targetProject.title = conceptValues["title"]
    targetProject.premise = conceptValues["premise"]
    targetProject.genre = conceptValues["genre"]
    targetProject.tone = conceptValues["tone"]
    targetProject.setting = conceptValues["setting"]

    try:
        conceptDbSession.commit()
        conceptDbSession.refresh(targetProject)

    except Exception:
        conceptDbSession.rollback()
        raise
    return targetProject

def listCharacters(rosterDbSession: Session, rosterProjectId: int) -> list[Character]:
    # gets ecery character from one project, oldest is first

    characterQuery = (
        select(Character)
        .where(Character.project_id == rosterProjectId)
        .order_by(Character.id)

    )

    return list(rosterDbSession.scalars(characterQuery))

def saveCharacters(castDbSession: Session, castProjectId: int, generatedCast: list) -> list[Character]:
    # turns Gemini's list of dicts into database rows

    newCharacterRows = []

    for oneGeneratedCharacter in generatedCast:

        characterRow = Character(
            project_id=castProjectId,
            name=oneGeneratedCharacter["name"],
            role=oneGeneratedCharacter["role"],
            traits=oneGeneratedCharacter["traits"],
            backstory=oneGeneratedCharacter["backstory"],

        )
        # one new row, filled from one character dict

        castDbSession.add(characterRow)
        # staged, hasn't saved yet
        newCharacterRows.append(characterRow)

    try:
        castDbSession.commit()
        # saves all of them at once

        for savedRow in newCharacterRows:
            castDbSession.refresh(savedRow)
            # reloads each one so it has its new id
    
    except Exception:
        castDbSession.rollback()
        # if saving fails, undo everything
        raise
    
    return newCharacterRows