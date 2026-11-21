"""User-safe, consistent v2 error responses, including request validation."""

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

logger = logging.getLogger(__name__)


class ApiError(Exception):
    def __init__(self, statusCode: int, error: str, message: str):
        self.statusCode = statusCode
        self.error = error
        self.message = message
        super().__init__(message)


def registerErrorHandlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def handleApiError(request: Request, exception: ApiError):
        return JSONResponse(
            status_code=exception.statusCode,
            content={"error": exception.error, "message": exception.message},
        )

    @app.exception_handler(RequestValidationError)
    async def handleValidationError(request: Request, exception: RequestValidationError):
        message = "Please enter a game idea."
        if any(error["loc"][0] == "path" for error in exception.errors()):
            message = "Please provide a valid project ID."
        return JSONResponse(
            status_code=400, content={"error": "invalid_input", "message": message}
        )

    @app.exception_handler(HTTPException)
    async def handleHttpError(request: Request, exception: HTTPException):
        error = "not_found" if exception.status_code == 404 else "invalid_input"
        return JSONResponse(
            status_code=exception.status_code,
            content={"error": error, "message": str(exception.detail)},
            headers=exception.headers,
        )

    @app.exception_handler(Exception)
    async def handleUnexpectedError(request: Request, exception: Exception):
        logger.exception("Unhandled backend error", exc_info=exception)
        return JSONResponse(
            status_code=500,
            content={"error": "internal_error", "message": "Something went wrong. Please try again."},
        )
