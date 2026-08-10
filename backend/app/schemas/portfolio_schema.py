from pydantic import BaseModel


class PortfolioItem(BaseModel):
    stock: str
    quantity: int
    avg_price: float
    current_price: float