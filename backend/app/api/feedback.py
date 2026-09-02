from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.database.models import RecommendationFeedback, User
from app.schemas.feedback_schema import FeedbackCreate, FeedbackResponse


router = APIRouter()


@router.post("", response_model=FeedbackResponse)
def submit_feedback(
    payload: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Store user feedback for a generated recommendation."""

    feedback = RecommendationFeedback(
        user_id=current_user.id,
        generation_id=payload.generation_id,
        recommendation_type=payload.recommendation_type,
        rating=payload.rating,
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return feedback


@router.get("", response_model=list[FeedbackResponse])
def get_my_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return feedback submitted by the authenticated user."""

    return (
        db.query(RecommendationFeedback)
        .filter(RecommendationFeedback.user_id == current_user.id)
        .order_by(RecommendationFeedback.id.desc())
        .all()
    )
