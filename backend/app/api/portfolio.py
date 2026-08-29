from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.database.models import User

from app.schemas.portfolio_schema import PortfolioItem
from app.schemas.portfolio_summary_schema import PortfolioSummary
from app.schemas.portfolio_risk_schema import PortfolioRisk
from app.schemas.portfolio_allocation_schema import (
    PortfolioAllocation,
)
from app.schemas.portfolio_performance_schema import (
    PortfolioPerformance,
)

from app.services.portfolio_service import (
    get_portfolio_data,
    get_portfolio_summary,
)

from app.services.analytics_service import (
    calculate_allocation,
    calculate_performance,
    calculate_risk_analysis,
)


router = APIRouter()


@router.get(
    "/",
    response_model=list[PortfolioItem],
)
def get_portfolio(
    current_user: User = Depends(
        get_current_user
    ),
):
    return get_portfolio_data(
        current_user.id
    )


@router.get(
    "/summary",
    response_model=PortfolioSummary,
)
def get_summary(
    current_user: User = Depends(
        get_current_user
    ),
):
    return get_portfolio_summary(
        current_user.id
    )


@router.get(
    "/allocation",
    response_model=list[PortfolioAllocation],
)
def get_allocation(
    current_user: User = Depends(
        get_current_user
    ),
):

    portfolio = get_portfolio_data(
        current_user.id
    )

    return calculate_allocation(
        portfolio
    )


@router.get(
    "/risk",
    response_model=PortfolioRisk,
)
def get_risk_analysis(
    current_user: User = Depends(
        get_current_user
    ),
):

    portfolio = get_portfolio_data(
        current_user.id
    )

    return calculate_risk_analysis(
        portfolio
    )


@router.get(
    "/performance",
    response_model=list[PortfolioPerformance],
)
def get_performance(
    current_user: User = Depends(
        get_current_user
    ),
):

    portfolio = get_portfolio_data(
        current_user.id
    )

    return calculate_performance(
        portfolio
    )