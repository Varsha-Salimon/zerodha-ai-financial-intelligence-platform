import csv
from pathlib import Path

from fastapi import APIRouter

from app.services.portfolio_service import get_portfolio_data
from app.services.analytics_service import (
    calculate_summary,
    calculate_allocation,
    calculate_risk_analysis,
    calculate_performance,
    calculate_contribution,
    calculate_sector_exposure,
    calculate_volatility,
    calculate_drawdown,
    calculate_benchmark_comparison,
    calculate_data_freshness,
)

router = APIRouter()


def get_market_data():
    data_file = (
        Path(__file__).resolve().parents[3]
        / "data"
        / "sample_market_data.csv"
    )

    with open(data_file, "r", newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


@router.get("/run")
def run_analytics():

    portfolio = get_portfolio_data()
    market_data = get_market_data()

    return {
        "summary": calculate_summary(portfolio),

        "allocation": calculate_allocation(
            portfolio
        ),

        "risk": calculate_risk_analysis(
            portfolio
        ),

        "performance": calculate_performance(
            portfolio
        ),

        "contribution": calculate_contribution(
            portfolio
        ),

        "sector_exposure": calculate_sector_exposure(
            portfolio
        ),

        "volatility": calculate_volatility(
            portfolio,
            market_data,
        ),

        "drawdown": calculate_drawdown(
            portfolio,
            market_data,
        ),

        "benchmark_comparison":
            calculate_benchmark_comparison(
                portfolio,
                market_data,
            ),

        "data_freshness":
            calculate_data_freshness(
                market_data,
            ),
    }