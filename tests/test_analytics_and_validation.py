import sys
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from app.services.analytics_service import (  # noqa: E402
    calculate_allocation,
    calculate_performance,
    calculate_risk_analysis,
)
from app.services.validation_service import (  # noqa: E402
    validate_ai_analysis,
)


class AnalyticsTests(unittest.TestCase):
    def setUp(self):
        self.portfolio = [
            {
                "stock": "TCS",
                "quantity": 10,
                "avg_price": 3000,
                "current_price": 3300,
                "sector": "IT",
            },
            {
                "stock": "INFOSYS",
                "quantity": 10,
                "avg_price": 2000,
                "current_price": 1900,
                "sector": "IT",
            },
        ]

    def test_performance_calculation(self):
        performance = calculate_performance(self.portfolio)

        self.assertEqual(len(performance), 2)
        self.assertEqual(performance[0]["profit"], 3000)
        self.assertEqual(performance[0]["return_percentage"], 10.0)
        self.assertEqual(performance[1]["profit"], -1000)
        self.assertEqual(performance[1]["return_percentage"], -5.0)

    def test_allocation_sums_to_100(self):
        allocation = calculate_allocation(self.portfolio)
        total_allocation = sum(
            item["allocation_percentage"]
            for item in allocation
        )

        self.assertAlmostEqual(total_allocation, 100.0, places=2)

    def test_concentration_risk(self):
        risk = calculate_risk_analysis(self.portfolio)

        self.assertEqual(risk["risk_level"], "MEDIUM")
        self.assertEqual(risk["largest_holding"], "TCS")
        self.assertAlmostEqual(
            risk["largest_allocation"],
            63.46,
            places=2,
        )


class ValidationTests(unittest.TestCase):
    def setUp(self):
        self.context = {
            "analytics": {
                "summary": {
                    "total_investment": 50000,
                    "current_value": 52000,
                    "profit": 2000,
                    "profit_percentage": 4.0,
                },
                "risk": {
                    "risk_level": "LOW",
                },
                "performance": [
                    {
                        "stock": "TCS",
                        "profit": 2000,
                        "return_percentage": 4.0,
                    }
                ],
            }
        }

    def valid_analysis(self):
        return {
            "portfolio_overview": "Portfolio performance is positive.",
            "key_observations": ["The supplied portfolio has positive performance."],
            "risk_analysis": {
                "risk_level": "LOW",
                "summary": "Concentration risk is relatively low.",
            },
            "performance_highlights": [
                {
                    "stock": "TCS",
                    "return_percentage": 4.0,
                    "profit": 2000,
                    "observation": "Positive contribution.",
                }
            ],
            "diversification_considerations": [
                "Continue reviewing portfolio allocation as conditions change."
            ],
            "disclaimer": "For informational purposes only.",
        }

    def test_valid_analysis_passes(self):
        result = validate_ai_analysis(
            self.valid_analysis(),
            self.context,
        )

        self.assertTrue(result["valid"])
        self.assertTrue(result["schema_valid"])
        self.assertTrue(result["grounding_valid"])
        self.assertTrue(result["policy_valid"])

    def test_prohibited_language_fails_policy_check(self):
        analysis = self.valid_analysis()
        analysis["key_observations"] = ["Buy this stock immediately."]

        result = validate_ai_analysis(
            analysis,
            self.context,
        )

        self.assertFalse(result["valid"])
        self.assertFalse(result["policy_valid"])

    def test_missing_field_fails_schema_check(self):
        analysis = self.valid_analysis()
        del analysis["risk_analysis"]

        result = validate_ai_analysis(
            analysis,
            self.context,
        )

        self.assertFalse(result["valid"])
        self.assertFalse(result["schema_valid"])


if __name__ == "__main__":
    unittest.main()
