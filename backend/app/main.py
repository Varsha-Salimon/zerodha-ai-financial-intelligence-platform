from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.portfolio import router as portfolio_router
from app.api.insights import router as insights_router


app = FastAPI(
    title="Zerodha AI Financial Intelligence Platform",
    version="1.0.0",
)


origins = [
    "http://localhost:3000",
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
    portfolio_router,
    prefix="/api/portfolio",
    tags=["Portfolio"],
)


app.include_router(
    insights_router,
    prefix="/api/insights",
    tags=["AI Insights"],
)