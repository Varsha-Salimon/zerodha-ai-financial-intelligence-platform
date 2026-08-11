from pydantic import BaseModel


class PortfolioRisk(BaseModel):
    risk_level: str
    largest_holding: str | None
    largest_allocation: float
    number_of_holdings: int
    message: str
