from typing import Literal

from pydantic import BaseModel


class FeedbackCreate(BaseModel):
    generation_id: str
    recommendation_type: str
    rating: Literal["HELPFUL", "NOT_HELPFUL"]


class FeedbackResponse(BaseModel):
    id: int
    generation_id: str
    recommendation_type: str
    rating: str

    class Config:
        from_attributes = True
