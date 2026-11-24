"""SQLite table definitions, connection setup, and request-scoped sessions."""

from collections.abc import Iterator
from datetime import UTC, datetime

from sqlalchemy import JSON, ForeignKey, Integer, Text, URL, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from .config import databasePath


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


class Base(DeclarativeBase):
    pass


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    original_idea: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str | None] = mapped_column(Text)
    premise: Mapped[str | None] = mapped_column(Text)
    genre: Mapped[str | None] = mapped_column(Text)
    tone: Mapped[str | None] = mapped_column(Text)
    setting: Mapped[str | None] = mapped_column(Text)
    # The scenes table and its relationship belong to a later milestone.
    current_scene_id: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[str] = mapped_column(Text, default=utcTimestamp, nullable=False)
    updated_at: Mapped[str] = mapped_column(
        Text, default=utcTimestamp, onupdate=utcTimestamp, nullable=False
    )

class Character(Base):
    # this class becomes a tbale in the db
    
    __tablename__ = "characters"
    # the table's name inside gamesmith.db

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # each char gets its own number

    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id"), nullable=False)
    # which project this character belongs to
    # foreign key = this has to match a real id in the projects table

    name: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(Text, nullable=False)
    # Text = a string column, nullable=False means it cant be left empty

    traits: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    # a list like ["loyal", "weird"]
    # JSON lets SQLite store a whole list in just one column

    backstory: Mapped[str] = mapped_column(Text, nullable=False)


engine = create_engine(
    URL.create("sqlite", database=str(databasePath)),
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def enableForeignKeys(dbConnection, connectionRecord) -> None:
    # SQLite requires this for each connection, outside a transaction.
    previousAutocommit = dbConnection.autocommit
    dbConnection.autocommit = True
    try:
        cursor = dbConnection.cursor()
        try:
            cursor.execute("PRAGMA foreign_keys=ON")
        finally:
            cursor.close()
    finally:
        dbConnection.autocommit = previousAutocommit


sessionFactory = sessionmaker(bind=engine, expire_on_commit=False)


def createTables() -> None:
    Base.metadata.create_all(engine)


def getSession() -> Iterator[Session]:
    with sessionFactory() as session:
        yield session
