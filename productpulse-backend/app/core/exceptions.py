from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger(__name__)


class AppException(Exception):
    """
    Base for all deliberate, expected application errors (Chapter 6 §14).
    Routers/services raise a specific subclass; main.py's handler turns it
    into the standard {success, message, error_code} envelope.
    """

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code: str = "INTERNAL_ERROR"

    def __init__(self, message: str, error_code: str | None = None):
        self.message = message
        if error_code:
            self.error_code = error_code
        super().__init__(message)


class ValidationAppException(AppException):
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "VALIDATION_ERROR"


class AuthenticationException(AppException):
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "AUTHENTICATION_ERROR"


class AuthorizationException(AppException):
    status_code = status.HTTP_403_FORBIDDEN
    error_code = "AUTHORIZATION_ERROR"


class NotFoundException(AppException):
    status_code = status.HTTP_404_NOT_FOUND
    error_code = "NOT_FOUND"


class ConflictException(AppException):
    status_code = status.HTTP_409_CONFLICT
    error_code = "CONFLICT"


class AIServiceException(AppException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    error_code = "AI_SERVICE_UNAVAILABLE"


def register_exception_handlers(app: FastAPI) -> None:
    """Call once at startup (see main.py)."""

    @app.exception_handler(AppException)
    async def handle_app_exception(_: Request, exc: AppException) -> JSONResponse:
        # 5xx errors are logged with a stack trace-worthy level; 4xx are expected traffic, not bugs.
        if exc.status_code >= 500:
            logger.error("Unhandled app error [%s]: %s", exc.error_code, exc.message)
        else:
            logger.info("Handled app error [%s]: %s", exc.error_code, exc.message)

        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "message": exc.message, "error_code": exc.error_code},
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        # Pydantic's default error list is verbose; collapse it to one readable message.
        first_error = exc.errors()[0] if exc.errors() else {}
        field = ".".join(str(loc) for loc in first_error.get("loc", []) if loc != "body")
        message = f"{field}: {first_error.get('msg', 'Invalid request body.')}" if field else "Invalid request body."

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"success": False, "message": message, "error_code": "VALIDATION_ERROR"},
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unexpected error: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "message": "An unexpected error occurred.", "error_code": "INTERNAL_ERROR"},
        )
