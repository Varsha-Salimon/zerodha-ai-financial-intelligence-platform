from pydantic import BaseModel
from typing import Any


class Recommendation(BaseModel):
    type: str
    title: str
    recommendation: str
    rationale: str
    supporting_metrics: dict[str, Any]
    confidence: str
    data_source: str
    disclaimer: str