from fastapi import APIRouter

from app.schemas.insight_schema import Insight

from app.services.portfolio_service import (
    get_portfolio_data,
    get_portfolio_summary,
)

from app.services.analytics_service import (
    calculate_risk_analysis,
    calculate_performance,
)

from app.services.insight_service import (
    generate_insights,
)


router = APIRouter()


@router.get(
    "/",
    response_model=list[Insight],
)
def get_insights():

    portfolio = get_portfolio_data()

    summary = get_portfolio_summary()

    risk = calculate_risk_analysis(portfolio)

    performance = calculate_performance(portfolio)

    return generate_insights(
        portfolio,
        summary,
        risk,
        performance,
    )