from pydantic import BaseModel


class PortfolioSummary(BaseModel):
    total_investment: float
    current_value: float
    profit: float
    profit_percentage: float
    best_performer: str | None
    worst_performer: str | None