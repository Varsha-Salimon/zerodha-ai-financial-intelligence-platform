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

