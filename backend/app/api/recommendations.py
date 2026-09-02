import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import SessionLocal
from app.database.models import RecommendationRecord, User
from app.schemas.recommendation_schema import Recommendation
from app.services.portfolio_service import (
    get_portfolio_data,
    get_portfolio_summary,
)
from app.services.analytics_service import (
    calculate_risk_analysis,
    calculate_performance,
)
from app.services.recommendation_service import generate_recommendations


router = APIRouter()


@router.post("/generate", response_model=list[Recommendation])
def generate_portfolio_recommendations(
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id

    portfolio = get_portfolio_data(user_id)
    summary = get_portfolio_summary(user_id)
    risk = calculate_risk_analysis(portfolio)
    performance = calculate_performance(portfolio)

    recommendations = generate_recommendations(
        portfolio,
        summary,
        risk,
        performance,
    )

    generation_id = str(uuid.uuid4())

    db: Session = SessionLocal()

    try:
        for recommendation in recommendations:
            record = RecommendationRecord(
                user_id=user_id,
                generation_id=generation_id,
                type=recommendation["type"],
                title=recommendation["title"],
                recommendation=recommendation["recommendation"],
                rationale=recommendation["rationale"],
                supporting_metrics=recommendation.get("supporting_metrics"),
                confidence=recommendation["confidence"],
                data_source=recommendation["data_source"],
                disclaimer=recommendation["disclaimer"],
            )
            db.add(record)

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

    return [
        {
            "generation_id": generation_id,
            **recommendation,
        }
        for recommendation in recommendations
    ]


@router.get("", response_model=list[Recommendation])
def get_recommendations(
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id

    db: Session = SessionLocal()

    try:
        latest_record = (
            db.query(RecommendationRecord)
            .filter(RecommendationRecord.user_id == user_id)
            .order_by(RecommendationRecord.id.desc())
            .first()
        )

        if not latest_record:
            return []

        latest_generation_id = latest_record.generation_id

        records = (
            db.query(RecommendationRecord)
            .filter(RecommendationRecord.user_id == user_id)
            .filter(RecommendationRecord.generation_id == latest_generation_id)
            .order_by(RecommendationRecord.id)
            .all()
        )

        return [
            {
                "generation_id": record.generation_id,
                "type": record.type,
                "title": record.title,
                "recommendation": record.recommendation,
                "rationale": record.rationale,
                "supporting_metrics": record.supporting_metrics,
                "confidence": record.confidence,
                "data_source": record.data_source,
                "disclaimer": record.disclaimer,
            }
            for record in records
        ]

    finally:
        db.close()
