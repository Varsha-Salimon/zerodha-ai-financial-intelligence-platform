import sys
import json
from pathlib import Path

from mcp.server.fastmcp import FastMCP


# Allow MCP server to import the backend package
PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_PATH = PROJECT_ROOT / "backend"

sys.path.insert(0, str(BACKEND_PATH))


from app.services.analytics_service import (
    calculate_summary,
    calculate_allocation,
    calculate_risk_analysis,
    calculate_performance,
)


mcp = FastMCP("Zerodha Financial Intelligence")


def load_portfolio():
    """
    Load portfolio data from the shared
    portfolio.json file.
    """

    data_file = (
        PROJECT_ROOT
        / "data"
        / "portfolio.json"
    )

    with open(data_file, "r") as file:
        return json.load(file)


@mcp.tool()
def get_portfolio() -> str:
    """
    Return the current portfolio holdings.

    Read-only tool for the AI system.
    """

    portfolio = load_portfolio()

    return json.dumps(
        portfolio,
        indent=4
    )


@mcp.tool()
def get_portfolio_summary() -> str:
    """
    Return overall portfolio summary including
    investment, current value, profit and return.
    """

    portfolio = load_portfolio()

    summary = calculate_summary(portfolio)

    return json.dumps(
        summary,
        indent=4
    )


@mcp.tool()
def get_portfolio_allocation() -> str:
    """
    Return portfolio allocation by stock.
    """

    portfolio = load_portfolio()

    allocation = calculate_allocation(
        portfolio
    )

    return json.dumps(
        allocation,
        indent=4
    )


@mcp.tool()
def get_portfolio_risk() -> str:
    """
    Analyze portfolio concentration risk.
    """

    portfolio = load_portfolio()

    risk = calculate_risk_analysis(
        portfolio
    )

    return json.dumps(
        risk,
        indent=4
    )


@mcp.tool()
def get_portfolio_performance() -> str:
    """
    Return performance information for
    each stock in the portfolio.
    """

    portfolio = load_portfolio()

    performance = calculate_performance(
        portfolio
    )

    return json.dumps(
        performance,
        indent=4
    )


if __name__ == "__main__":
    mcp.run()
