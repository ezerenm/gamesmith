"""SQLite table definitions, connection setup, and request-scoped sessions."""

from collections.abc import Iterator
from datetime import UTC, datetime

from sqlalchemy import Integer, Text, URL, create_engine, event
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
