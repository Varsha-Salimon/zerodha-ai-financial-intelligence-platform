from pydantic import BaseModel


class Insight(BaseModel):
    type: str
    title: str
    message: str
    severity: str
    stock: str | None = None