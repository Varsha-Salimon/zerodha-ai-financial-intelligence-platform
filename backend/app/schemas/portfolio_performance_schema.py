from pydantic import BaseModel


class PortfolioPerformance(BaseModel):
    stock: str
    investment: float
    current_value: float
    profit: float
    return_percentage: float
