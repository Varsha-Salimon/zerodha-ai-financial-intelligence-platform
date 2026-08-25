def calculate_summary(portfolio):

    total_investment = 0
    current_value = 0

    best_performer = None
    worst_performer = None

    best_profit = None
    worst_profit = None

    for stock in portfolio:

        investment = (
            stock["quantity"] *
            stock["avg_price"]
        )

        value = (
            stock["quantity"] *
            stock["current_price"]
        )

        profit = value - investment

        total_investment += investment
        current_value += value

        if best_profit is None or profit > best_profit:
            best_profit = profit
            best_performer = stock["stock"]

        if worst_profit is None or profit < worst_profit:
            worst_profit = profit
            worst_performer = stock["stock"]

    profit = current_value - total_investment

    if total_investment > 0:
        profit_percentage = (
            profit / total_investment
        ) * 100
    else:
        profit_percentage = 0

    return {
        "total_investment": total_investment,
        "current_value": current_value,
        "profit": profit,
        "profit_percentage": round(
            profit_percentage, 2
        ),
        "best_performer": best_performer,
        "worst_performer": worst_performer,
    }


def calculate_allocation(portfolio):

    total_current_value = 0

    for stock in portfolio:
        total_current_value += (
            stock["quantity"] *
            stock["current_price"]
        )

    if total_current_value == 0:
        return []

    allocation = []

    for stock in portfolio:

        current_value = (
            stock["quantity"] *
            stock["current_price"]
        )

        allocation_percentage = (
            current_value /
            total_current_value
        ) * 100

        allocation.append({
            "stock": stock["stock"],
            "current_value": current_value,
            "allocation_percentage": round(
                allocation_percentage, 2
            ),
        })

    return allocation


def calculate_risk_analysis(portfolio):
    """
    Analyze portfolio concentration and identify
    the primary concentration risk.
    """

    if not portfolio:
        return {
            "risk_level": "LOW",
            "largest_holding": None,
            "largest_allocation": 0,
            "number_of_holdings": 0,
            "message": "No portfolio holdings available.",
        }

    total_current_value = sum(
        stock["quantity"] * stock["current_price"]
        for stock in portfolio
    )

    if total_current_value == 0:
        return {
            "risk_level": "LOW",
            "largest_holding": None,
            "largest_allocation": 0,
            "number_of_holdings": len(portfolio),
            "message": "Portfolio has no current value.",
        }

    largest_stock = max(
        portfolio,
        key=lambda stock:
        stock["quantity"] * stock["current_price"],
    )

    largest_value = (
        largest_stock["quantity"]
        * largest_stock["current_price"]
    )

    largest_allocation = (
        largest_value / total_current_value
    ) * 100

    if largest_allocation >= 50:
        risk_level = "HIGH"
        message = (
            f"{largest_stock['stock']} represents "
            f"{largest_allocation:.2f}% of the portfolio. "
            "The portfolio has high concentration risk."
        )

    elif largest_allocation >= 35:
        risk_level = "MEDIUM"
        message = (
            f"{largest_stock['stock']} represents "
            f"{largest_allocation:.2f}% of the portfolio. "
            "The portfolio has moderate concentration risk."
        )

    else:
        risk_level = "LOW"
        message = (
            f"The largest holding is "
            f"{largest_stock['stock']} at "
            f"{largest_allocation:.2f}% of the portfolio. "
            "Portfolio concentration is relatively low."
        )

    return {
        "risk_level": risk_level,
        "largest_holding": largest_stock["stock"],
        "largest_allocation": round(
            largest_allocation, 2
        ),
        "number_of_holdings": len(portfolio),
        "message": message,
    }

def calculate_performance(portfolio):

    performance = []

    for stock in portfolio:

        investment = (
            stock["quantity"] *
            stock["avg_price"]
        )

        current_value = (
            stock["quantity"] *
            stock["current_price"]
        )

        profit = current_value - investment

        if investment > 0:
            return_percentage = (
                profit / investment
            ) * 100
        else:
            return_percentage = 0

        performance.append({
            "stock": stock["stock"],
            "investment": investment,
            "current_value": current_value,
            "profit": profit,
            "return_percentage": round(
                return_percentage,
                2,
            ),
        })

    return performance

def calculate_contribution(portfolio):
    """
    Calculate each holding's contribution to total portfolio P&L.
    """

    total_profit = 0

    holding_profits = []

    for stock in portfolio:
        investment = (
            stock["quantity"] *
            stock["avg_price"]
        )

        current_value = (
            stock["quantity"] *
            stock["current_price"]
        )

        profit = current_value - investment

        total_profit += profit

        holding_profits.append({
            "stock": stock["stock"],
            "profit": profit,
        })

    contribution = []

    for item in holding_profits:

        if total_profit != 0:
            contribution_percentage = (
                item["profit"] /
                total_profit
            ) * 100
        else:
            contribution_percentage = 0

        contribution.append({
            "stock": item["stock"],
            "profit": round(item["profit"], 2),
            "contribution_percentage": round(
                contribution_percentage,
                2,
            ),
        })

    return contribution


def calculate_sector_exposure(portfolio):
    """
    Calculate portfolio exposure by sector.
    """

    sector_values = {}

    total_value = 0

    for stock in portfolio:

        current_value = (
            stock["quantity"] *
            stock["current_price"]
        )

        sector = stock.get(
            "sector",
            "Unknown",
        )

        sector_values[sector] = (
            sector_values.get(sector, 0)
            + current_value
        )

        total_value += current_value

    if total_value == 0:
        return []

    exposure = []

    for sector, value in sector_values.items():

        percentage = (
            value /
            total_value
        ) * 100

        exposure.append({
            "sector": sector,
            "current_value": round(
                value,
                2,
            ),
            "exposure_percentage": round(
                percentage,
                2,
            ),
        })

    return exposure


def calculate_volatility(portfolio, market_data):
    """
    Return volatility markers for portfolio holdings.
    """

    market_lookup = {
        item["Stock"]: item
        for item in market_data
    }

    volatility = []

    for stock in portfolio:

        market = market_lookup.get(
            stock["stock"]
        )

        if not market:
            continue

        volatility.append({
            "stock": stock["stock"],
            "volatility": float(
                market.get(
                    "Volatility",
                    0,
                )
            ),
            "change_percentage": float(
                market.get(
                    "ChangePercent",
                    0,
                )
            ),
        })

    return volatility


def calculate_drawdown(portfolio, market_data):
    """
    Return drawdown markers for portfolio holdings.
    """

    market_lookup = {
        item["Stock"]: item
        for item in market_data
    }

    drawdown = []

    for stock in portfolio:

        market = market_lookup.get(
            stock["stock"]
        )

        if not market:
            continue

        drawdown.append({
            "stock": stock["stock"],
            "drawdown_percentage": float(
                market.get(
                    "Drawdown",
                    0,
                )
            ),
        })

    return drawdown


def calculate_benchmark_comparison(
    portfolio,
    market_data,
):
    """
    Compare portfolio movement with benchmark movement.
    """

    if not portfolio:
        return {
            "portfolio_change_percentage": 0,
            "benchmark_change_percentage": 0,
            "relative_performance": 0,
        }

    total_previous_value = 0
    total_current_value = 0

    market_lookup = {
        item["Stock"]: item
        for item in market_data
    }

    benchmark_change = 0

    for stock in portfolio:

        market = market_lookup.get(
            stock["stock"]
        )

        if not market:
            continue

        current_value = (
            stock["quantity"] *
            stock["current_price"]
        )

        previous_price = float(
            market.get(
                "PreviousPrice",
                stock["current_price"],
            )
        )

        previous_value = (
            stock["quantity"] *
            previous_price
        )

        total_current_value += current_value
        total_previous_value += previous_value

        benchmark_change = float(
            market.get(
                "BenchmarkChangePercent",
                0,
            )
        )

    if total_previous_value > 0:

        portfolio_change = (
            (
                total_current_value -
                total_previous_value
            )
            / total_previous_value
        ) * 100

    else:
        portfolio_change = 0

    relative_performance = (
        portfolio_change -
        benchmark_change
    )

    return {
        "portfolio_change_percentage": round(
            portfolio_change,
            2,
        ),
        "benchmark_change_percentage": round(
            benchmark_change,
            2,
        ),
        "relative_performance": round(
            relative_performance,
            2,
        ),
    }


def calculate_data_freshness(market_data):
    """
    Return the latest timestamp available in market data.
    """

    if not market_data:
        return {
            "status": "UNAVAILABLE",
            "latest_timestamp": None,
        }

    timestamps = [
        item.get("Timestamp")
        for item in market_data
        if item.get("Timestamp")
    ]

    if not timestamps:
        return {
            "status": "UNKNOWN",
            "latest_timestamp": None,
        }

    latest_timestamp = max(timestamps)

    return {
        "status": "AVAILABLE",
        "latest_timestamp": latest_timestamp,
        "source": "Sample market data",
    }