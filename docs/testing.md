# Testing

The project includes a lightweight automated test suite focused on the deterministic analytics and AI-output validation layers.

## Test Coverage

### Portfolio Analytics

The tests cover:

- Holding-level profit/loss calculation.
- Holding-level return percentage calculation.
- Portfolio allocation summing to approximately 100%.
- Concentration-risk classification.
- Identification of the largest holding.

### AI Output Validation

The tests cover:

- Valid structured AI analysis passing validation.
- Missing required fields failing schema validation.
- Prohibited trading/action language failing policy validation.

## Running the Tests

From the project root:

```bash
python -m unittest discover -s tests -p "test_*.py" -v
```

The tests are intentionally independent of the live Gemini API and brokerage integrations. This keeps the core analytics and validation checks deterministic and repeatable.

## Manual End-to-End Checks

The deployed application is also manually checked through the primary user journey:

1. User login.
2. Portfolio loading.
3. Portfolio analytics and risk views.
4. AI analysis generation.
5. Recommendation generation.
6. Recommendation feedback submission.
7. User/admin role separation.
8. Admin operations and compliance views.
9. Backend and MCP health visibility.
10. Deployed frontend/backend connectivity.

The test strategy focuses on validating the parts of the system that can be reliably asserted in code while using the deployed application for end-to-end integration verification.
