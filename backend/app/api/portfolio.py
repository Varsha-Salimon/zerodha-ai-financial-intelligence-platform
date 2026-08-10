from fastapi import APIRouter

from app.schemas.portfolio_schema import PortfolioItem
from app.schemas.portfolio_summary_schema import PortfolioSummary
from app.services.portfolio_service import (
    get_portfolio_data,
    get_portfolio_summary,
)

from app.services.analytics_service import (
    calculate_allocation,
)
from app.schemas.portfolio_allocation_schema import (
    PortfolioAllocation,
)

router = APIRouter()


@router.get("/", response_model=list[PortfolioItem])
def get_portfolio():
    return get_portfolio_data()


@router.get("/summary", response_model=PortfolioSummary)
def get_summary():
    return get_portfolio_summary()


@router.get(
    "/allocation",
    response_model=list[PortfolioAllocation],
)
def get_allocation():

    portfolio = get_portfolio_data()

    return calculate_allocation(portfolio)

