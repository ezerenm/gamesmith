from typing import Annotated

from fastapi import APIRouter, Depends, Path

from sqlalchemy.orm import Session

from .. import crud

from ..database import getSession

from ..errors import ApiError

from ..geminiService import generateJson

from ..models import ContinueSceneRequest, ErrorResponse, SceneResponse

from ..prompts import buildNextScenePrompt, sceneFieldNames, sceneSchema

router = APIRouter(prefix="/scenes", tags=["scenes"])

SceneSessionDependency = Annotated[Session, Depends(getSession)]

SceneId = Annotated[int, Path(gt=0)]

@router.post(
    "/{continueSceneId}/continue", response_model=SceneResponse,

    responses={

        400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}, 422: {"model": ErrorResponse}, 503: {"model": ErrorResponse},

    },
)

def continueScene(continueSceneId: SceneId, continueRequest: ContinueSceneRequest, continueSession: SceneSessionDependency):

    parentScene = crud.getScene(continueSession, continueSceneId)

    if parentScene is None:

        raise ApiError(404, "not_found", "Scene not found.")

    pickedChoiceIndex = continueRequest.choice_index

    if pickedChoiceIndex < 0 or pickedChoiceIndex >= len(parentScene.choices):

        raise ApiError(400, "invalid_input", "Please pick between choices 0 or 1.")

    sceneOwnerProject = crud.getProject(continueSession, parentScene.project_id)

    existingChildScene = crud.findChildScene(continueSession, parentScene.id, pickedChoiceIndex)

    if existingChildScene is not None:

        return crud.moveToExistingChild(continueSession, parentScene, sceneOwnerProject, existingChildScene, pickedChoiceIndex)

    pickedChoiceText = parentScene.choices[pickedChoiceIndex]["text"]

    nextSceneCastMembers = crud.listCharacters(continueSession, sceneOwnerProject.id)

    nextScenePromptText = buildNextScenePrompt(sceneOwnerProject, nextSceneCastMembers, parentScene.text, pickedChoiceText)

    generatedNextScene = generateJson(nextScenePromptText, sceneSchema, sceneFieldNames)

    nextChoiceTexts = generatedNextScene["choices"]

    if len(nextChoiceTexts) != 2:

        raise ApiError(422, "invalid_generation", "The AI gave an unusable answer. Please try again.")

    for checkedNextChoiceText in nextChoiceTexts:

        if checkedNextChoiceText.strip() == "":

            raise ApiError(422, "invalid_generation", "The AI gave an unusable answer. Please try again.")
    
    return crud.saveChildScene(continueSession, parentScene, sceneOwnerProject, pickedChoiceIndex, generatedNextScene)