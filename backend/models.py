from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


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


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]


class WorkspaceResponse(BaseModel):
    project: ProjectResponse
    # No character/scene persistence exists in Milestone 1.
    characters: list[dict]
    scenes: list[dict]


class ErrorResponse(BaseModel):
    error: str
    message: str
