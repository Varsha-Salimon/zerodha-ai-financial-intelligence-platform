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
