from pydantic import BaseModel
from typing import Any


class Recommendation(BaseModel):
    generation_id: str
    type: str
    title: str
    recommendation: str
    rationale: str
    supporting_metrics: dict[str, Any]
    confidence: str
    data_source: str
    disclaimer: str
