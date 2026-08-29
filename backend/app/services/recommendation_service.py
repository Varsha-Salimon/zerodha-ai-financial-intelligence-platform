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

    recommendations: list[dict[str, Any]] = []

    # ========================================================
    # Basic portfolio information
    # ========================================================

    number_of_holdings = risk.get(
        "number_of_holdings",
        len(portfolio),
    )

    risk_level = risk.get(
        "risk_level",
        "LOW",
    )

    largest_holding = risk.get(
        "largest_holding"
    )

    largest_allocation = float(
        risk.get(
            "largest_allocation",
            0,
        )
        or 0
    )

    total_profit = float(
        summary.get(
            "profit",
            0,
        )
        or 0
    )

    portfolio_return = float(
        summary.get(
            "profit_percentage",
            0,
        )
        or 0
    )

    # ========================================================
    # Helper
    # ========================================================

    def add_recommendation(
        recommendation_type: str,
        title: str,
        recommendation: str,
        rationale: str,
        supporting_metrics: dict[str, Any],
        confidence: str,
        data_source: str,
    ) -> None:

        recommendations.append(
            {
                "type": recommendation_type,
                "title": title,
                "recommendation": recommendation,
                "rationale": rationale,
                "supporting_metrics": supporting_metrics,
                "confidence": confidence,
                "data_source": data_source,
                "disclaimer": DISCLAIMER,
            }
        )

    # ========================================================
    # 1. Concentration recommendation
    # ========================================================

    if largest_holding:

        if largest_allocation >= 50:

            add_recommendation(
                recommendation_type="concentration",
                title="Review Portfolio Concentration",
                recommendation=(
                    f"Review whether the current allocation "
                    f"to {largest_holding} is consistent with "
                    "your intended portfolio strategy."
                ),
                rationale=(
                    f"{largest_holding} represents "
                    f"{largest_allocation:.2f}% of the "
                    "portfolio, creating a high concentration "
                    "in one holding."
                ),
                supporting_metrics={
                    "largest_holding": largest_holding,
                    "allocation_percentage": (
                        round(
                            largest_allocation,
                            2,
                        )
                    ),
                    "risk_level": risk_level,
                    "number_of_holdings": (
                        number_of_holdings
                    ),
                },
                confidence="HIGH",
                data_source="Portfolio analytics",
            )

        elif largest_allocation >= 35:

            add_recommendation(
                recommendation_type="concentration",
                title="Review Concentration Exposure",
                recommendation=(
                    f"Consider reviewing the current "
                    f"{largest_holding} allocation against "
                    "your intended portfolio strategy."
                ),
                rationale=(
                    f"{largest_holding} represents "
                    f"{largest_allocation:.2f}% of the "
                    "portfolio. The analytics classify "
                    "the portfolio as having moderate "
                    "concentration risk."
                ),
                supporting_metrics={
                    "largest_holding": largest_holding,
                    "allocation_percentage": (
                        round(
                            largest_allocation,
                            2,
                        )
                    ),
                    "risk_level": risk_level,
                    "number_of_holdings": (
                        number_of_holdings
                    ),
                },
                confidence="HIGH",
                data_source="Portfolio analytics",
            )

    # ========================================================
    # 2. Negative performance recommendation
    # ========================================================

    negative_holdings = [
        item
        for item in performance
        if float(
            item.get(
                "return_percentage",
                0,
            )
            or 0
        ) < 0
    ]

    for item in negative_holdings:

        stock = item.get(
            "stock",
            "Unknown",
        )

        return_percentage = float(
            item.get(
                "return_percentage",
                0,
            )
            or 0
        )

        profit = float(
            item.get(
                "profit",
                0,
            )
            or 0
        )

        add_recommendation(
            recommendation_type="performance",
            title=f"Monitor {stock} Performance",
            recommendation=(
                f"Monitor the performance of "
                f"{stock} and review whether the "
                "holding continues to fit your "
                "intended portfolio strategy."
            ),
            rationale=(
                f"{stock} currently has a "
                f"{return_percentage:.2f}% return "
                f"and a profit/loss of "
                f"{profit:.2f}."
            ),
            supporting_metrics={
                "stock": stock,
                "investment": item.get(
                    "investment",
                    0,
                ),
                "current_value": item.get(
                    "current_value",
                    0,
                ),
                "profit": profit,
                "return_percentage": (
                    return_percentage
                ),
            },
            confidence="HIGH",
            data_source=(
                "Portfolio performance analytics"
            ),
        )

    # ========================================================
    # 3. Diversification recommendation
    #
    # Instead of simply saying <= 3 holdings is risky,
    # consider both number of holdings and concentration.
    # ========================================================

    if number_of_holdings == 1:

        add_recommendation(
            recommendation_type="diversification",
            title="Review Portfolio Diversification",
            recommendation=(
                "Consider reviewing whether maintaining "
                "exposure to only one holding is consistent "
                "with your intended portfolio strategy."
            ),
            rationale=(
                "The portfolio currently contains one "
                "holding, meaning the overall portfolio "
                "is highly dependent on the performance "
                "of a single asset."
            ),
            supporting_metrics={
                "number_of_holdings": number_of_holdings,
                "risk_level": risk_level,
            },
            confidence="HIGH",
            data_source="Portfolio risk analytics",
        )

    elif (
        number_of_holdings <= 3
        and largest_allocation < 35
    ):

        add_recommendation(
            recommendation_type="diversification",
            title="Review Portfolio Diversification",
            recommendation=(
                "Review whether the current number of "
                "holdings provides the level of diversification "
                "appropriate for your investment objectives."
            ),
            rationale=(
                f"The portfolio currently contains "
                f"{number_of_holdings} holdings. A relatively "
                "small number of holdings can increase the "
                "impact of individual holding performance."
            ),
            supporting_metrics={
                "number_of_holdings": number_of_holdings,
                "largest_allocation": (
                    round(
                        largest_allocation,
                        2,
                    )
                ),
                "risk_level": risk_level,
            },
            confidence="MEDIUM",
            data_source="Portfolio risk analytics",
        )

    elif (
        number_of_holdings >= 4
        and largest_allocation < 35
    ):

        add_recommendation(
            recommendation_type="diversification",
            title="Maintain Diversified Exposure",
            recommendation=(
                "Continue monitoring the balance across "
                "holdings and sectors as the portfolio evolves."
            ),
            rationale=(
                f"The portfolio contains "
                f"{number_of_holdings} holdings, with the "
                f"largest holding representing only "
                f"{largest_allocation:.2f}% of total value. "
                "Current holding-level concentration appears "
                "relatively balanced."
            ),
            supporting_metrics={
                "number_of_holdings": number_of_holdings,
                "largest_holding": largest_holding,
                "largest_allocation": (
                    round(
                        largest_allocation,
                        2,
                    )
                ),
                "risk_level": risk_level,
            },
            confidence="MEDIUM",
            data_source="Portfolio risk analytics",
        )

    # ========================================================
    # 4. Strong portfolio performance observation
    #
    # Useful when a healthy portfolio has no warning.
    # ========================================================

    if (
        portfolio_return >= 5
        and total_profit > 0
        and not negative_holdings
    ):

        add_recommendation(
            recommendation_type="performance",
            title="Monitor Positive Portfolio Momentum",
            recommendation=(
                "Continue monitoring portfolio performance "
                "and whether the current holdings remain "
                "aligned with your intended strategy."
            ),
            rationale=(
                f"The portfolio currently has a "
                f"{portfolio_return:.2f}% overall return "
                "with all tracked holdings showing positive "
                "performance."
            ),
            supporting_metrics={
                "portfolio_return_percentage": (
                    round(
                        portfolio_return,
                        2,
                    )
                ),
                "total_profit": round(
                    total_profit,
                    2,
                ),
                "number_of_holdings": (
                    number_of_holdings
                ),
            },
            confidence="MEDIUM",
            data_source=(
                "Portfolio performance analytics"
            ),
        )

    # ========================================================
    # 5. Positive portfolio with moderate return
    #
    # Prevents a completely empty recommendation set
    # for a healthy portfolio.
    # ========================================================

    if (
        portfolio_return >= 0
        and portfolio_return < 5
        and total_profit >= 0
        and not negative_holdings
        and largest_allocation < 35
    ):

        add_recommendation(
            recommendation_type="portfolio_monitoring",
            title="Continue Portfolio Monitoring",
            recommendation=(
                "Continue monitoring portfolio performance, "
                "allocation, and sector exposure as market "
                "conditions change."
            ),
            rationale=(
                f"The portfolio currently has a "
                f"{portfolio_return:.2f}% overall return "
                f"across {number_of_holdings} holdings, "
                "with no individual holding currently "
                "showing a negative return."
            ),
            supporting_metrics={
                "portfolio_return_percentage": (
                    round(
                        portfolio_return,
                        2,
                    )
                ),
                "total_profit": round(
                    total_profit,
                    2,
                ),
                "number_of_holdings": (
                    number_of_holdings
                ),
                "largest_allocation": (
                    round(
                        largest_allocation,
                        2,
                    )
                ),
            },
            confidence="MEDIUM",
            data_source="Portfolio analytics",
        )

    # ========================================================
    # 6. Portfolio currently losing overall
    #
    # This catches a scenario where individual holdings
    # may have mixed results but the total portfolio is down.
    # ========================================================

    if total_profit < 0:

        add_recommendation(
            recommendation_type="portfolio_performance",
            title="Review Overall Portfolio Performance",
            recommendation=(
                "Review the portfolio's current performance "
                "and assess whether the existing allocation "
                "continues to match your intended strategy."
            ),
            rationale=(
                f"The portfolio currently shows an overall "
                f"loss of {abs(total_profit):.2f}, corresponding "
                f"to a return of {portfolio_return:.2f}%."
            ),
            supporting_metrics={
                "total_profit": round(
                    total_profit,
                    2,
                ),
                "portfolio_return_percentage": (
                    round(
                        portfolio_return,
                        2,
                    )
                ),
                "number_of_holdings": (
                    number_of_holdings
                ),
            },
            confidence="HIGH",
            data_source=(
                "Portfolio performance analytics"
            ),
        )

    # ========================================================
    # 7. No recommendations / healthy portfolio fallback
    #
    # This ensures the UI never looks broken because the
    # deterministic rules found no warning.
    # ========================================================

    if not recommendations:

        add_recommendation(
            recommendation_type="portfolio_monitoring",
            title="Portfolio Appears Balanced",
            recommendation=(
                "Continue monitoring portfolio allocation, "
                "performance, and market conditions. No major "
                "deterministic portfolio concerns were identified "
                "from the currently available data."
            ),
            rationale=(
                f"The portfolio contains "
                f"{number_of_holdings} holdings and the "
                f"largest holding represents "
                f"{largest_allocation:.2f}% of portfolio value. "
                f"The current overall return is "
                f"{portfolio_return:.2f}%."
            ),
            supporting_metrics={
                "number_of_holdings": (
                    number_of_holdings
                ),
                "largest_holding": largest_holding,
                "largest_allocation": (
                    round(
                        largest_allocation,
                        2,
                    )
                ),
                "risk_level": risk_level,
                "portfolio_return_percentage": (
                    round(
                        portfolio_return,
                        2,
                    )
                ),
                "total_profit": round(
                    total_profit,
                    2,
                ),
            },
            confidence="MEDIUM",
            data_source="Portfolio analytics",
        )

    return recommendations