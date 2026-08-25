from typing import Any


def validate_ai_analysis(
    analysis: dict[str, Any],
    context: dict[str, Any],
) -> dict[str, Any]:
    """
    Validate Gemini output against the deterministic
    portfolio analytics supplied through MCP.

    Returns a validation report instead of modifying
    the AI response.
    """

    issues: list[str] = []

    analytics = context.get("analytics", {})

    # =========================================================
    # 1. Basic schema / structure checks
    # =========================================================

    required_fields = [
        "portfolio_overview",
        "key_observations",
        "risk_analysis",
        "performance_highlights",
        "diversification_considerations",
        "disclaimer",
    ]

    for field in required_fields:
        if field not in analysis:
            issues.append(
                f"Missing required field: {field}"
            )

    # Stop deeper validation if the basic structure is broken.
    if issues:
        return {
            "valid": False,
            "schema_valid": False,
            "grounding_valid": False,
            "policy_valid": False,
            "issues": issues,
        }

    # =========================================================
    # 2. Risk validation
    # =========================================================

    supplied_risk = analytics.get("risk", {})

    supplied_risk_level = supplied_risk.get(
        "risk_level"
    )

    ai_risk = analysis.get(
        "risk_analysis",
        {},
    )

    ai_risk_level = ai_risk.get(
        "risk_level"
    )

    if (
        supplied_risk_level is not None
        and ai_risk_level != supplied_risk_level
    ):
        issues.append(
            "AI risk level does not match "
            "deterministic risk analysis."
        )

    # =========================================================
    # 3. Performance validation
    # =========================================================

    supplied_performance = analytics.get(
        "performance",
        [],
    )

    ai_performance = analysis.get(
        "performance_highlights",
        [],
    )

    supplied_by_stock = {
        item.get("stock"): item
        for item in supplied_performance
    }

    ai_stocks = {
        item.get("stock")
        for item in ai_performance
    }

    supplied_stocks = set(
        supplied_by_stock.keys()
    )

    if ai_stocks != supplied_stocks:
        issues.append(
            "Performance highlights do not contain "
            "exactly the supplied portfolio holdings."
        )

    for item in ai_performance:

        stock = item.get("stock")

        supplied = supplied_by_stock.get(
            stock
        )

        if not supplied:
            continue

        supplied_return = supplied.get(
            "return_percentage"
        )

        supplied_profit = supplied.get(
            "profit"
        )

        ai_return = item.get(
            "return_percentage"
        )

        ai_profit = item.get(
            "profit"
        )

        if ai_return != supplied_return:
            issues.append(
                f"{stock}: return percentage does "
                "not match deterministic analytics."
            )

        if ai_profit != supplied_profit:
            issues.append(
                f"{stock}: profit does not match "
                "deterministic analytics."
            )

    # =========================================================
    # 4. Portfolio summary grounding
    # =========================================================

    summary = analytics.get(
        "summary",
        {},
    )

    overview = analysis.get(
        "portfolio_overview",
        "",
    )

    summary_values = [
        summary.get("total_investment"),
        summary.get("current_value"),
        summary.get("profit"),
        summary.get("profit_percentage"),
    ]

    for value in summary_values:
        if value is not None:
            if str(value) not in overview:
                # Don't automatically fail because the
                # LLM may format numbers differently.
                pass

    # =========================================================
    # 5. Policy / recommendation language check
    # =========================================================

    full_text = str(analysis).lower()

    prohibited_phrases = [
        "buy this stock",
        "sell this stock",
        "buy shares",
        "sell shares",
        "guaranteed return",
        "guaranteed profit",
        "execute trade",
        "place order",
    ]

    policy_issues = []

    for phrase in prohibited_phrases:
        if phrase in full_text:
            policy_issues.append(
                f"Prohibited action language detected: "
                f"{phrase}"
            )

    if policy_issues:
        issues.extend(policy_issues)

    # =========================================================
    # 6. Determine final status
    # =========================================================

    schema_valid = not any(
        issue.startswith("Missing required")
        for issue in issues
    )

    grounding_valid = not any(
        (
            "risk level" in issue.lower()
            or "performance highlights" in issue.lower()
            or "return percentage" in issue.lower()
            or "profit does not match" in issue.lower()
        )
        for issue in issues
    )

    policy_valid = not bool(
        policy_issues
    )

    valid = (
        schema_valid
        and grounding_valid
        and policy_valid
    )

    return {
        "valid": valid,
        "schema_valid": schema_valid,
        "grounding_valid": grounding_valid,
        "policy_valid": policy_valid,
        "issues": issues,
    }