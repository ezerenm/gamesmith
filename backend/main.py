from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from .config import corsOrigins
from .database import createTables, engine
from .errors import registerErrorHandlers
from .routers.projects import router as projectsRouter
from .routers.scenes import router as scenesRouter


@asynccontextmanager
async def lifespan(app: FastAPI):
    createTables()
    try:
        yield
    finally:
        engine.dispose()


app = FastAPI(title="GameSmith API", version="2.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=corsOrigins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
registerErrorHandlers(app)
app.include_router(projectsRouter)
app.include_router(scenesRouter)


def apiSchema():
    if app.openapi_schema is None:
        schema = get_openapi(title=app.title, version=app.version, routes=app.routes)
        # FastAPI's default validation response is 422; v2 uses 400 instead.
        for pathItem in schema["paths"].values():
            for operation in pathItem.values():
                if isinstance(operation, dict):
                    operation.get("responses", {}).pop("422", None)
        app.openapi_schema = schema
    return app.openapi_schema


app.openapi = apiSchema


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
