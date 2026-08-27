from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.routers import analysis, analytics, auth, feedback, health, insights, products, roadmap, users

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("ProductPulse AI API starting up (debug=%s)", settings.debug)
    yield
    logger.info("ProductPulse AI API shutting down")


app = FastAPI(
    title="ProductPulse AI API",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/api/v1")
def root() -> dict:
    return {
        "name": "ProductPulse AI API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "health": "/api/v1/health",
    }


register_exception_handlers(app)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(feedback.router)
app.include_router(analysis.router)
app.include_router(insights.router)
app.include_router(roadmap.router)
app.include_router(analytics.router)
app.include_router(users.router)
