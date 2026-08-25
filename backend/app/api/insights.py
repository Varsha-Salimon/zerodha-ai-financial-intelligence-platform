from fastapi import APIRouter

from app.schemas.insight_schema import Insight
from app.schemas.ai_analysis_schema import AIAnalysis

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

from app.services.ai_analysis_service import (
    generate_portfolio_ai_analysis,
)


router = APIRouter()


@router.get(
    "/",
    response_model=list[Insight],
)
def get_insights():

    portfolio = get_portfolio_data()

    summary = get_portfolio_summary()

    risk = calculate_risk_analysis(
        portfolio
    )

    performance = calculate_performance(
        portfolio
    )

    return generate_insights(
        portfolio,
        summary,
        risk,
        performance,
    )


@router.get(
    "/ai",
    response_model=AIAnalysis,
)
async def get_ai_analysis():

    return await generate_portfolio_ai_analysis()