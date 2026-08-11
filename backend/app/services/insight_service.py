def generate_insights(
    portfolio,
    summary,
    risk,
    performance,
):
    insights = []

    # Overall portfolio performance
    if summary["profit"] > 0:
        insights.append({
            "type": "performance",
            "title": "Positive Portfolio Performance",
            "message": (
                f"Your portfolio is up "
                f"{summary['profit_percentage']:.2f}% "
                f"overall."
            ),
            "severity": "positive",
            "stock": None,
        })

    elif summary["profit"] < 0:
        insights.append({
            "type": "performance",
            "title": "Portfolio Decline",
            "message": (
                f"Your portfolio is down "
                f"{abs(summary['profit_percentage']):.2f}% "
                f"overall."
            ),
            "severity": "warning",
            "stock": None,
        })

    # Concentration risk
    if risk["risk_level"] == "HIGH":
        insights.append({
            "type": "risk",
            "title": "High Concentration Risk",
            "message": risk["message"],
            "severity": "warning",
            "stock": risk["largest_holding"],
        })

    elif risk["risk_level"] == "MEDIUM":
        insights.append({
            "type": "risk",
            "title": "Moderate Concentration Risk",
            "message": risk["message"],
            "severity": "warning",
            "stock": risk["largest_holding"],
        })

    else:
        insights.append({
            "type": "risk",
            "title": "Low Concentration Risk",
            "message": risk["message"],
            "severity": "positive",
            "stock": risk["largest_holding"],
        })

    # Individual stock performance
    for item in performance:

        if item["return_percentage"] < 0:
            insights.append({
                "type": "attention",
                "title": "Holding Needs Attention",
                "message": (
                    f"{item['stock']} is currently "
                    f"down {abs(item['return_percentage']):.2f}%."
                ),
                "severity": "warning",
                "stock": item["stock"],
            })

    return insights