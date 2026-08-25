import uuid

from fastapi import APIRouter

from app.database.database import SessionLocal
from app.database.models import RecommendationRecord

from app.schemas.recommendation_schema import Recommendation

from app.services.portfolio_service import (
    get_portfolio_data,
    get_portfolio_summary,
)

from app.services.analytics_service import (
    calculate_risk_analysis,
    calculate_performance,
)

from app.services.recommendation_service import (
    generate_recommendations,
)


router = APIRouter()


@router.post(
    "/generate",
    response_model=list[Recommendation],
)
def generate_portfolio_recommendations():

    # ----------------------------------------------------
    # Retrieve portfolio data
    # ----------------------------------------------------

    portfolio = get_portfolio_data()

    summary = get_portfolio_summary()

    risk = calculate_risk_analysis(
        portfolio
    )

    performance = calculate_performance(
        portfolio
    )

    # ----------------------------------------------------
    # Generate recommendations
    # ----------------------------------------------------

    recommendations = generate_recommendations(
        portfolio,
        summary,
        risk,
        performance,
    )

    # ----------------------------------------------------
    # Create generation ID
    # ----------------------------------------------------

    generation_id = str(
        uuid.uuid4()
    )

    # ----------------------------------------------------
    # Save recommendations to PostgreSQL
    # ----------------------------------------------------

    db = SessionLocal()

    try:

        for recommendation in recommendations:

            record = RecommendationRecord(
                generation_id=generation_id,
                type=recommendation["type"],
                title=recommendation["title"],
                recommendation=recommendation[
                    "recommendation"
                ],
                rationale=recommendation[
                    "rationale"
                ],
                supporting_metrics=recommendation.get(
                    "supporting_metrics"
                ),
                confidence=recommendation[
                    "confidence"
                ],
                data_source=recommendation[
                    "data_source"
                ],
                disclaimer=recommendation[
                    "disclaimer"
                ],
            )

            db.add(record)

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

    # ----------------------------------------------------
    # Return the same response as before
    # ----------------------------------------------------

    return recommendations

@router.get(
    "",
    response_model=list[Recommendation],
)
def get_recommendations():

    db = SessionLocal()

    try:
        # Get the most recent generation
        latest_record = (
            db.query(RecommendationRecord)
            .order_by(
                RecommendationRecord.id.desc()
            )
            .first()
        )

        if not latest_record:
            return []

        latest_generation_id = (
            latest_record.generation_id
        )

        records = (
            db.query(RecommendationRecord)
            .filter(
                RecommendationRecord.generation_id
                == latest_generation_id
            )
            .order_by(
                RecommendationRecord.id
            )
            .all()
        )

        return [
            {
                "type": record.type,
                "title": record.title,
                "recommendation": record.recommendation,
                "rationale": record.rationale,
                "supporting_metrics": (
                    record.supporting_metrics
                ),
                "confidence": record.confidence,
                "data_source": record.data_source,
                "disclaimer": record.disclaimer,
            }
            for record in records
        ]

    finally:
        db.close()