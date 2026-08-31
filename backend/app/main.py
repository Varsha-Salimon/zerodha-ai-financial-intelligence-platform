import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.portfolio import router as portfolio_router
from app.api.insights import router as insights_router
from app.api.recommendations import router as recommendations_router
from app.api.analytics import router as analytics_router
from app.api.audit import router as audit_router
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.portfolio_upload import router as portfolio_upload_router

from app.database.database import Base, engine
from app.database import models


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Zerodha AI Financial Intelligence Platform",
    version="1.0.0",
)


origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000",
    ).split(",")
    if origin.strip()
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Backend is running"
    }

app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"],
)

app.include_router(
    portfolio_router,
    prefix="/api/portfolio",
    tags=["Portfolio"],
)


app.include_router(
    insights_router,
    prefix="/api/insights",
    tags=["AI Insights"],
)

app.include_router(
    recommendations_router,
    prefix="/api/recommendations",
    tags=["Recommendations"],
)

app.include_router(
    analytics_router,
    prefix="/api/analytics",
    tags=["Analytics"],
)

app.include_router(
    audit_router,
    prefix="/api/audit",
    tags=["Audit"],
)

app.include_router(
    admin_router,
    prefix="/api/admin",
    tags=["Administration"],
)

app.include_router(
    portfolio_upload_router,
    prefix="/api/portfolio",
    tags=["Portfolio Upload"],
)