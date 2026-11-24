from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Project, utcTimestamp


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
