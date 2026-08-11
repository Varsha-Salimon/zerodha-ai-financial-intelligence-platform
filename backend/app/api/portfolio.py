from fastapi import APIRouter

from app.schemas.portfolio_schema import PortfolioItem
from app.schemas.portfolio_summary_schema import PortfolioSummary
from app.schemas.portfolio_risk_schema import PortfolioRisk

from app.services.portfolio_service import (
    get_portfolio_data,
    get_portfolio_summary,
)

from app.services.analytics_service import (
    calculate_allocation,
    calculate_performance,
    calculate_risk_analysis,
)
from app.schemas.portfolio_allocation_schema import (
    PortfolioAllocation,
)

from app.schemas.portfolio_performance_schema import (
    PortfolioPerformance,
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

@router.get(
    "/risk",
    response_model=PortfolioRisk,
)
def get_risk_analysis():

    portfolio = get_portfolio_data()

    return calculate_risk_analysis(portfolio)

@router.get(
    "/performance",
    response_model=list[PortfolioPerformance],
)
def get_performance():

    portfolio = get_portfolio_data()

    return calculate_performance(portfolio)
