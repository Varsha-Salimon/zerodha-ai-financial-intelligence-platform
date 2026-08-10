from pydantic import BaseModel


class PortfolioAllocation(BaseModel):
    stock: str
    current_value: float
    allocation_percentage: float
