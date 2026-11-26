from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CreateProjectRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    original_idea: str

    @field_validator("original_idea")
    @classmethod
    def validateOriginalIdea(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Please enter a game idea.")
        # Validate without rewriting the user's saved original idea.
        return value


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_idea: str
    title: str | None
    premise: str | None
    genre: str | None
    tone: str | None
    setting: str | None
    current_scene_id: int | None
    created_at: datetime
    updated_at: datetime

class CreateCharactersRequest(BaseModel):
    
    model_config = ConfigDict(extra="forbid")
    # reject any fields we did not ask for

    count: int = Field(default=3, ge=1, le=5)
    # how many characters to create
    # default is 3 if they send {}, ge1 means at least one and le5 means at most 5

class CharacterResponse(BaseModel):
    # the shape of ONE character we send back
    model_config = ConfigDict(from_attributes=True)
    # lets Pydantic read straight from a database Character row

    id: int
    project_id: int
    name: str
    role: str
    traits: list[str]
    backstory: str

class CharacterListResponse(BaseModel):
    
    characters: list[CharacterResponse]

class SceneChoiceResponse(BaseModel):

    index: int
    text: str

class SceneResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    parent_scene_id: int | None
    from_choice_index: int | None
    text: str
    choices: list[SceneChoiceResponse]
    selected_choice: int | None
    created_at: datetime


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]


class WorkspaceResponse(BaseModel):
    project: ProjectResponse
    characters: list[CharacterResponse]
    scenes: list[SceneResponse]


class ErrorResponse(BaseModel):
    error: str
    message: str
