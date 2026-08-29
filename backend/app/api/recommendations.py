import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import (
    get_current_user,
)

from app.database.database import (
    SessionLocal,
)

from app.database.models import (
    RecommendationRecord,
    User,
)

from app.schemas.recommendation_schema import (
    Recommendation,
)

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


# ============================================================
# GENERATE RECOMMENDATIONS
# ============================================================

@router.post(
    "/generate",
    response_model=list[Recommendation],
)
def generate_portfolio_recommendations(
    current_user: User = Depends(
        get_current_user
    ),
):

    # --------------------------------------------------------
    # Get the logged-in user's ID
    # --------------------------------------------------------

    user_id = current_user.id

    # --------------------------------------------------------
    # Retrieve THIS USER'S portfolio
    # --------------------------------------------------------

    portfolio = get_portfolio_data(
        user_id
    )

    summary = get_portfolio_summary(
        user_id
    )

    risk = calculate_risk_analysis(
        portfolio
    )

    performance = calculate_performance(
        portfolio
    )

    # --------------------------------------------------------
    # Generate recommendations
    # --------------------------------------------------------

    recommendations = generate_recommendations(
        portfolio,
        summary,
        risk,
        performance,
    )

    # --------------------------------------------------------
    # Create generation ID
    # --------------------------------------------------------

    generation_id = str(
        uuid.uuid4()
    )

    # --------------------------------------------------------
    # Save recommendations
    # --------------------------------------------------------

    db: Session = SessionLocal()

    try:

        for recommendation in recommendations:

            record = RecommendationRecord(

                # IMPORTANT:
                # Associate recommendation with
                # the logged-in user.
                user_id=user_id,

                generation_id=generation_id,

                type=recommendation[
                    "type"
                ],

                title=recommendation[
                    "title"
                ],

                recommendation=recommendation[
                    "recommendation"
                ],

                rationale=recommendation[
                    "rationale"
                ],

                supporting_metrics=(
                    recommendation.get(
                        "supporting_metrics"
                    )
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

    return recommendations


# ============================================================
# GET LATEST RECOMMENDATIONS
# ============================================================

@router.get(
    "",
    response_model=list[Recommendation],
)
def get_recommendations(
    current_user: User = Depends(
        get_current_user
    ),
):

    user_id = current_user.id

    db: Session = SessionLocal()

    try:

        # ----------------------------------------------------
        # Find the latest recommendation generation
        # FOR THIS USER ONLY.
        # ----------------------------------------------------

        latest_record = (
            db.query(
                RecommendationRecord
            )
            .filter(
                RecommendationRecord.user_id
                == user_id
            )
            .order_by(
                RecommendationRecord.id.desc()
            )
            .first()
        )

        # ----------------------------------------------------
        # No recommendations for this user
        # ----------------------------------------------------

        if not latest_record:

            return []

        latest_generation_id = (
            latest_record.generation_id
        )

        # ----------------------------------------------------
        # Retrieve only records belonging to:
        #
        # 1. Current user
        # 2. Latest generation
        # ----------------------------------------------------

        records = (
            db.query(
                RecommendationRecord
            )
            .filter(
                RecommendationRecord.user_id
                == user_id
            )
            .filter(
                RecommendationRecord.generation_id
                == latest_generation_id
            )
            .order_by(
                RecommendationRecord.id
            )
            .all()
        )

        # ----------------------------------------------------
        # Return API response
        # ----------------------------------------------------

        return [
            {
                "type": record.type,

                "title": record.title,

                "recommendation":
                    record.recommendation,

                "rationale":
                    record.rationale,

                "supporting_metrics":
                    record.supporting_metrics,

                "confidence":
                    record.confidence,

                "data_source":
                    record.data_source,

                "disclaimer":
                    record.disclaimer,
            }

            for record in records
        ]

    finally:

        db.close()