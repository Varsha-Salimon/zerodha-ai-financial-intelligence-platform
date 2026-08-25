from typing import Any


DISCLAIMER = (
    "This recommendation is informational only and does not "
    "constitute financial, investment, or trading advice."
)


def generate_recommendations(
    portfolio: list[dict[str, Any]],
    summary: dict[str, Any],
    risk: dict[str, Any],
    performance: list[dict[str, Any]],
) -> list[dict[str, Any]]:

    recommendations = []

    # ========================================================
    # 1. Concentration recommendation
    # ========================================================

    largest_holding = risk.get("largest_holding")
    largest_allocation = risk.get(
        "largest_allocation",
        0,
    )

    if largest_holding:

        if largest_allocation >= 50:

            recommendations.append({
                "type": "concentration",
                "title": "Review Portfolio Concentration",
                "recommendation": (
                    f"Review whether the current allocation "
                    f"to {largest_holding} is consistent with "
                    "your intended portfolio strategy."
                ),
                "rationale": (
                    f"{largest_holding} represents "
                    f"{largest_allocation:.2f}% of the "
                    "portfolio, creating a high concentration "
                    "in one holding."
                ),
                "supporting_metrics": {
                    "largest_holding": largest_holding,
                    "allocation_percentage": largest_allocation,
                    "risk_level": risk.get(
                        "risk_level"
                    ),
                    "number_of_holdings": risk.get(
                        "number_of_holdings"
                    ),
                },
                "confidence": "HIGH",
                "data_source": "Portfolio analytics",
                "disclaimer": DISCLAIMER,
            })

        elif largest_allocation >= 35:

            recommendations.append({
                "type": "concentration",
                "title": "Review Concentration Exposure",
                "recommendation": (
                    f"Consider reviewing the current "
                    f"{largest_holding} allocation against "
                    "your intended portfolio strategy."
                ),
                "rationale": (
                    f"{largest_holding} represents "
                    f"{largest_allocation:.2f}% of the "
                    "portfolio. The analytics classify "
                    "the portfolio as having moderate "
                    "concentration risk."
                ),
                "supporting_metrics": {
                    "largest_holding": largest_holding,
                    "allocation_percentage": largest_allocation,
                    "risk_level": risk.get(
                        "risk_level"
                    ),
                    "number_of_holdings": risk.get(
                        "number_of_holdings"
                    ),
                },
                "confidence": "HIGH",
                "data_source": "Portfolio analytics",
                "disclaimer": DISCLAIMER,
            })

    # ========================================================
    # 2. Negative performance recommendation
    # ========================================================

    negative_holdings = [
        item
        for item in performance
        if item.get("return_percentage", 0) < 0
    ]

    for item in negative_holdings:

        recommendations.append({
            "type": "performance",
            "title": f"Monitor {item['stock']} Performance",
            "recommendation": (
                f"Monitor the performance of "
                f"{item['stock']} and review whether "
                "the holding continues to fit your "
                "intended portfolio strategy."
            ),
            "rationale": (
                f"{item['stock']} currently has a "
                f"{item['return_percentage']:.2f}% return "
                f"and a profit/loss of "
                f"{item['profit']:.2f}."
            ),
            "supporting_metrics": {
                "stock": item["stock"],
                "investment": item["investment"],
                "current_value": item["current_value"],
                "profit": item["profit"],
                "return_percentage": item[
                    "return_percentage"
                ],
            },
            "confidence": "HIGH",
            "data_source": "Portfolio performance analytics",
            "disclaimer": DISCLAIMER,
        })

    # ========================================================
    # 3. Diversification recommendation
    # ========================================================

    number_of_holdings = risk.get(
        "number_of_holdings",
        0,
    )

    if number_of_holdings > 0 and number_of_holdings <= 3:

        recommendations.append({
            "type": "diversification",
            "title": "Review Portfolio Diversification",
            "recommendation": (
                "Review whether the current number of "
                "holdings provides the level of diversification "
                "appropriate for your investment objectives."
            ),
            "rationale": (
                f"The portfolio currently contains "
                f"{number_of_holdings} holdings. A small number "
                "of holdings can increase the impact of individual "
                "holding performance on the overall portfolio."
            ),
            "supporting_metrics": {
                "number_of_holdings": number_of_holdings,
                "risk_level": risk.get(
                    "risk_level"
                ),
            },
            "confidence": "HIGH",
            "data_source": "Portfolio risk analytics",
            "disclaimer": DISCLAIMER,
        })

    return recommendations