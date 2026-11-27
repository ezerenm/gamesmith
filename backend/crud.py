from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Character, Project, Scene, utcTimestamp


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

def listScenes(sceneListDbSession: Session, sceneListProjectId: int) -> list[Scene]:

    sceneQuery = (
        select(Scene)
        .where(Scene.project_id == sceneListProjectId)
        .order_by(Scene.id)

    )

    return list(sceneListDbSession.scalars(sceneQuery))

def getOpeningScene(openingCheckDbSession: Session, openingCheckProjectId: int) -> Scene | None:

    openingSceneQuery = (
        select(Scene)
        .where(Scene.project_id == openingCheckProjectId)
        .where(Scene.parent_scene_id.is_(None))

    )

    return openingCheckDbSession.scalars(openingSceneQuery).first()

def saveOpeningScene(openingDbSession: Session, openingProject: Project, generatedSceneValues: dict) -> Scene:

    numberedChoices = []

    choiceNumber = 0

    for oneChoiceText in generatedSceneValues["choices"]:

        numberedChoices.append({"index": choiceNumber, "text": oneChoiceText})

        choiceNumber = choiceNumber + 1

    openingSceneRow = Scene(
        project_id=openingProject.id,
        parent_scene_id=None,
        from_choice_index=None,
        text=generatedSceneValues["text"],
        choices=numberedChoices,
        selected_choice=None,

    )

    try:

        openingDbSession.add(openingSceneRow)

        openingDbSession.flush()

        openingProject.current_scene_id = openingSceneRow.id

        openingDbSession.commit()

        openingDbSession.refresh(openingSceneRow)

    except Exception:
        openingDbSession.rollback()
        raise
    
    return openingSceneRow

def getScene(sceneLookupDbSession: Session, lookupSceneId: int) -> Scene | None:

    return sceneLookupDbSession.get(Scene, lookupSceneId)

def findChildScene(childCheckDbSession: Session, childParentSceneId: int, childChoiceIndex: int) -> Scene | None:

    childSceneQuery = (

        select(Scene)
        .where(Scene.parent_scene_id == childParentSceneId)
        .where(Scene.from_choice_index == childChoiceIndex)

    )

    return childCheckDbSession.scalars(childSceneQuery).first()

def moveToExistingChild(revisitDbSession: Session, revisitParentScene: Scene, revisitProject: Project, revisitChildScene: Scene, revisitChoiceIndex: int) -> Scene:

    revisitParentScene.selected_choice = revisitChoiceIndex

    revisitProject.current_scene_id = revisitChildScene.id

    try:

        revisitDbSession.commit()

        revisitDbSession.refresh(revisitChildScene)

    except Exception:

        revisitDbSession.rollback()

        raise
        
    return revisitChildScene
    
def saveChildScene(childDbSession: Session, childParentScene: Scene, childProject: Project, pickedChoiceIndex: int, generatedChildValues: dict) -> Scene:

    childNumberedChoices = []

    childChoiceNumber = 0

    for oneChildChoiceText in generatedChildValues["choices"]:

        childNumberedChoices.append({"index": childChoiceNumber, "text": oneChildChoiceText})

        childChoiceNumber = childChoiceNumber + 1
    
    childSceneRow = Scene (

        project_id=childProject.id,

        parent_scene_id=childParentScene.id,

        from_choice_index=pickedChoiceIndex,

        text=generatedChildValues["text"],

        choices=childNumberedChoices,

        selected_choice=None,

    )

    try:

        childDbSession.add(childSceneRow)

        childDbSession.flush()

        childParentScene.selected_choice = pickedChoiceIndex

        childProject.current_scene_id = childSceneRow.id

        childDbSession.commit()

        childDbSession.refresh(childSceneRow)

    except Exception:

        childDbSession.rollback()

        raise
    
    return childSceneRow

    
