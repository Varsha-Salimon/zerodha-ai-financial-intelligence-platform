import csv
import json
import sys
from pathlib import Path

from mcp.server.fastmcp import FastMCP


# Allow MCP server to import the backend package
PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_PATH = PROJECT_ROOT / "backend"

sys.path.insert(0, str(BACKEND_PATH))


from app.services.portfolio_service import (
    get_portfolio_data,
)

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


mcp = FastMCP("Zerodha Financial Intelligence")


def load_market_data():
    """
    Load market data used by deterministic analytics.
    """

    data_file = (
        PROJECT_ROOT
        / "data"
        / "sample_market_data.csv"
    )

    with open(
        data_file,
        "r",
        newline="",
        encoding="utf-8",
    ) as file:
        return list(
            csv.DictReader(file)
        )


def load_news_data():
    """
    Load sample market/news information used
    as controlled contextual data for AI analysis.
    """

    data_file = (
        PROJECT_ROOT
        / "data"
        / "sample_news.csv"
    )

    with open(
        data_file,
        "r",
        newline="",
        encoding="utf-8",
    ) as file:
        return list(
            csv.DictReader(file)
        )


def get_relevant_news(
    portfolio,
    news,
):
    """
    Return news only for stocks currently
    held in the specified user's portfolio.
    """

    portfolio_stocks = {
        item["stock"]
        for item in portfolio
    }

    relevant_news = [
        item
        for item in news
        if item.get("Stock")
        in portfolio_stocks
    ]

    return relevant_news


# ============================================================
# Portfolio MCP tools
# ============================================================


@mcp.tool()
def get_portfolio(
    user_id: int,
) -> str:
    """
    Return the current portfolio holdings
    for the specified user.

    Read-only tool for the AI system.
    """

    portfolio = get_portfolio_data(
        user_id
    )

    return json.dumps(
        portfolio,
        indent=4,
    )


@mcp.tool()
def get_portfolio_summary(
    user_id: int,
) -> str:
    """
    Return overall portfolio summary
    for the specified user.
    """

    portfolio = get_portfolio_data(
        user_id
    )

    summary = calculate_summary(
        portfolio
    )

    return json.dumps(
        summary,
        indent=4,
    )


@mcp.tool()
def get_portfolio_allocation(
    user_id: int,
) -> str:
    """
    Return portfolio allocation by stock
    for the specified user.
    """

    portfolio = get_portfolio_data(
        user_id
    )

    allocation = calculate_allocation(
        portfolio
    )

    return json.dumps(
        allocation,
        indent=4,
    )


@mcp.tool()
def get_portfolio_risk(
    user_id: int,
) -> str:
    """
    Analyze portfolio concentration risk
    for the specified user.
    """

    portfolio = get_portfolio_data(
        user_id
    )

    risk = calculate_risk_analysis(
        portfolio
    )

    return json.dumps(
        risk,
        indent=4,
    )


@mcp.tool()
def get_portfolio_performance(
    user_id: int,
) -> str:
    """
    Return performance information for
    each stock in the specified user's portfolio.
    """

    portfolio = get_portfolio_data(
        user_id
    )

    performance = calculate_performance(
        portfolio
    )

    return json.dumps(
        performance,
        indent=4,
    )


@mcp.tool()
def get_portfolio_analytics(
    user_id: int,
) -> str:
    """
    Return the complete deterministic portfolio
    analytics package for the specified user.

    Includes summary, allocation, risk,
    performance, contribution, sector exposure,
    volatility, drawdown, benchmark comparison,
    and data freshness.
    """

    portfolio = get_portfolio_data(
        user_id
    )

    market_data = load_market_data()

    analytics = {
        "summary": calculate_summary(
            portfolio
        ),

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

        "sector_exposure":
            calculate_sector_exposure(
                portfolio
            ),

        "volatility":
            calculate_volatility(
                portfolio,
                market_data,
            ),

        "drawdown":
            calculate_drawdown(
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

    return json.dumps(
        analytics,
        indent=4,
    )


# ============================================================
# Shared market data
# ============================================================


@mcp.tool()
def get_market_data() -> str:
    """
    Return current market information
    available in the controlled market dataset.

    Market data is shared and is not
    user-specific.
    """

    market_data = load_market_data()

    return json.dumps(
        market_data,
        indent=4,
    )


@mcp.tool()
def get_market_news() -> str:
    """
    Return available market/news context.

    News data is shared and is not
    user-specific.
    """

    news = load_news_data()

    return json.dumps(
        news,
        indent=4,
    )


@mcp.tool()
def get_portfolio_news(
    user_id: int,
) -> str:
    """
    Return news relevant to the specified
    user's portfolio holdings.

    Read-only MCP tool for AI analysis.
    """

    portfolio = get_portfolio_data(
        user_id
    )

    news = load_news_data()

    relevant_news = get_relevant_news(
        portfolio,
        news,
    )

    return json.dumps(
        relevant_news,
        indent=4,
    )


if __name__ == "__main__":
    mcp.run()