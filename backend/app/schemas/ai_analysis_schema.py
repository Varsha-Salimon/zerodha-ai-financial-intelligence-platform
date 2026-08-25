from pydantic import BaseModel


class PerformanceHighlight(BaseModel):
    stock: str
    return_percentage: float
    profit: float
    observation: str


class RiskAnalysis(BaseModel):
    risk_level: str
    summary: str

class MarketContext(BaseModel):
    stock: str
    headline: str
    observation: str

class AIAnalysis(BaseModel):
    portfolio_overview: str
    key_observations: list[str]
    risk_analysis: RiskAnalysis
    performance_highlights: list[PerformanceHighlight]
    diversification_considerations: list[str]
    market_context: list[MarketContext]
    disclaimer: str
    