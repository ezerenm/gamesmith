from typing import Annotated

from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from .. import crud
from ..database import getSession
from ..errors import ApiError
from ..models import (
    CreateProjectRequest, ErrorResponse, ProjectListResponse,
    ProjectResponse, WorkspaceResponse,
)

router = APIRouter(prefix="/projects", tags=["projects"])
SessionDependency = Annotated[Session, Depends(getSession)]
ProjectId = Annotated[int, Path(gt=0)]
invalidInputResponse = {400: {"model": ErrorResponse}}


@router.post("", response_model=ProjectResponse, status_code=201, responses=invalidInputResponse)
def createProject(body: CreateProjectRequest, session: SessionDependency):
    return crud.createProject(session, body.original_idea)


@router.get("", response_model=ProjectListResponse)
def listProjects(session: SessionDependency):
    return {"projects": crud.listProjects(session)}


@router.get(
    "/{id}", response_model=WorkspaceResponse,
    responses={**invalidInputResponse, 404: {"model": ErrorResponse}},
)
def getProject(id: ProjectId, session: SessionDependency):
    project = crud.getProject(session, id)
    if project is None:
        raise ApiError(404, "not_found", "Project not found.")
    return {"project": project, "characters": [], "scenes": []}
