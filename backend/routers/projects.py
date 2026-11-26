from typing import Annotated

from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from .. import crud
from ..database import getSession
from ..errors import ApiError
from ..geminiService import generateJson

from ..models import (
    CharacterListResponse, CreateCharactersRequest, CreateProjectRequest, ErrorResponse, ProjectListResponse,
    ProjectResponse, SceneResponse, WorkspaceResponse,
)
from ..prompts import buildCharactersPrompt, buildConceptPrompt, buildCharactersSchema, buildOpeningScenePrompt, characterListFieldNames, conceptFieldNames, conceptSchema, sceneFieldNames, sceneSchema

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
    return {"project": project, "characters": crud.listCharacters(session, id), "scenes": crud.listScenes(session,id),}

@router.post(
    "/{conceptProjectId}/concept", response_model=ProjectResponse,
    responses={
        **invalidInputResponse, 404: {"model": ErrorResponse},
        422: {"model": ErrorResponse}, 503: {"model": ErrorResponse},
    },
)

def generateConcept(conceptProjectId: ProjectId, conceptSession:
    SessionDependency):
    foundProject = crud.getProject(conceptSession, conceptProjectId)

    if foundProject is None:
        raise ApiError(404, "not_found", "Project not found.")

    conceptPromptText = buildConceptPrompt(foundProject.original_idea)
    generatedConcept = generateJson(conceptPromptText, conceptSchema, conceptFieldNames)

    return crud.saveConcept(conceptSession, foundProject, generatedConcept)

@router.post(
    "/{characterProjectId}/characters", response_model=CharacterListResponse,

    responses={
        **invalidInputResponse, 404: {"model": ErrorResponse}, 409: {"model": ErrorResponse},
        422: {"model": ErrorResponse}, 503: {"model": ErrorResponse},

    },

)
# URL turns into /projects{id}/characters

def generateCharacters(
    characterProjectId: ProjectId,
    characterRequest: CreateCharactersRequest,
    characterSession: SessionDependency,

):

    # characterRequest = the { "count": 3 } body, already checked by Pydantic

    parentProject = crud.getProject(characterSession, characterProjectId)

    if parentProject is None:
        raise ApiError(404, "not_found", "Project not found.")

    if parentProject.title is None:
        raise ApiError(409, "concept_required", "Generate a concept before creating characters.")
    # no concept = nothing for the characters to fit into
    # 409 concept_required comes from our API contract

    existingCharacters = crud.listCharacters(characterSession, characterProjectId)
    existingNames = []

    for existingCharacter in existingCharacters:
        existingNames.append(existingCharacter.name)
    # collect the names already used so Gemini does not repeat them

    requestedCount = characterRequest.count
    characterPromptText = buildCharactersPrompt(parentProject, existingNames, requestedCount)
    characterSchema = buildCharactersSchema(requestedCount)

    generatedReply = generateJson(characterPromptText, characterSchema, characterListFieldNames)
    # geminiService retries, fallback, json check reused
    generatedCharacterList = generatedReply["characters"]

    if len(generatedCharacterList) == 0:
        raise ApiError(422, "invalid_generation", "The AI gave an unusable answer. Please try again.")
    
    for checkedCharacter in generatedCharacterList:
        for neededField in ["name", "role", "traits", "backstory"]:
            if neededField not in checkedCharacter:
                raise ApiError(422, "invalid_generation", "The AI gave an unusable answer. Please try again.")

    savedCharacters = crud.saveCharacters(characterSession, characterProjectId, generatedCharacterList)

    return {"characters": savedCharacters}

@router.post(
    "/{sceneProjectId}/scenes", response_model=SceneResponse,

    responses={
        **invalidInputResponse, 404: {"model": ErrorResponse}, 409: {"model": ErrorResponse},
        422: {"model": ErrorResponse}, 503: {"model": ErrorResponse},

    },
)

def generateOpeningScene(sceneProjectId: ProjectId, sceneSession: SessionDependency):

    storyOwnerProject = crud.getProject(sceneSession, sceneProjectId)

    if storyOwnerProject is None:
        raise ApiError(404, "not_found", "Project not found.")

    if storyOwnerProject.title is None:
        raise ApiError(409, "concept_required", "Generate a concept before creating scenes.")

    existingOpeningScene = crud.getOpeningScene(sceneSession, sceneProjectId)

    if existingOpeningScene is not None:
        raise ApiError(400, "invalid_input", "This project already has an opening scene.")

    sceneCastMembers = crud.listCharacters(sceneSession, sceneProjectId)

    openingPromptText = buildOpeningScenePrompt(storyOwnerProject, sceneCastMembers)

    generatedOpeningScene = generateJson(openingPromptText, sceneSchema, sceneFieldNames)

    generatedChoiceTexts = generatedOpeningScene["choices"]

    if len(generatedChoiceTexts) != 2:
        raise ApiError(422, "invalid_generation", "The AI gave an unusable answer. Please try again.")

    for checkedChoiceText in generatedChoiceTexts:
        if checkedChoiceText.strip() == "":
            raise ApiError(422, "invalid_generation", "The AI gave an unusable answer. Please try again.")

    return crud.saveOpeningScene(sceneSession, storyOwnerProject, generatedOpeningScene)
