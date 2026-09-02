# MCP Server Documentation

## Purpose

The Model Context Protocol (MCP) layer provides the Portfolio Agent with explicit, structured tools for retrieving portfolio, analytics, market, and news context.

MCP is used as a **controlled tool boundary**. The AI workflow does not receive unrestricted access to the application's database or internal services.

## Available Tools

| Tool | Purpose |
|---|---|
| `get_portfolio` | Retrieve the authenticated user's portfolio holdings |
| `get_portfolio_summary` | Retrieve portfolio-level summary metrics |
| `get_portfolio_allocation` | Retrieve holding allocation information |
| `get_portfolio_risk` | Retrieve portfolio concentration/risk information |
| `get_portfolio_performance` | Retrieve holding-level performance information |
| `get_portfolio_analytics` | Retrieve combined portfolio analytics used by the AI workflow |
| `get_market_data` | Retrieve available sample market/benchmark context |
| `get_market_news` | Retrieve available sample market/news context |
| `get_portfolio_news` | Retrieve portfolio-relevant news context |

## Data Flow

```text
Portfolio Agent
      ↓
MCP tool request
      ↓
MCP server
      ↓
Portfolio / analytics / market / news service
      ↓
Structured tool response
      ↓
Portfolio Agent
      ↓
Gemini context
```

## User Scoping

Portfolio-related MCP requests are made with the authenticated user's identity. This keeps the AI workflow aligned with the same user-scoping boundary used by the REST API.

Administrative telemetry is handled separately through protected backend audit endpoints.

## Tool Response Principles

MCP tools return structured application data rather than free-form model-generated financial claims. The returned context can include:

- Holdings.
- Investment and current value.
- Profit/loss and return.
- Allocation.
- Concentration/risk.
- Performance.
- Contribution.
- Sector exposure.
- Volatility/drawdown markers.
- Benchmark context.
- Market/news context.
- Data freshness metadata.

## AI Integration

The Portfolio Agent assembles the relevant MCP results and passes the structured context to Google Gemini. Gemini is responsible for interpretation and explanation, not for calculating the underlying portfolio metrics.

The downstream validation layer checks the generated result for schema, grounding, financial consistency, risk consistency, and prohibited language before presentation.

## Environment Configuration

The MCP workflow uses the same backend environment configuration as the application. Relevant configuration includes:

```env
DATABASE_URL=<postgresql-connection-string>
GEMINI_API_KEY=<gemini-api-key>
GEMINI_MODEL=gemini-3.1-flash-lite
JWT_SECRET_KEY=<strong-random-secret>
FRONTEND_URL=http://localhost:3000
```

Secrets must not be committed to the repository.

## Running the Application

The MCP workflow is integrated with the backend application. Start the backend from the `backend` directory with:

```bash
uvicorn app.main:app --reload
```

The AI workflow initializes/uses the MCP tool layer as part of portfolio analysis.

For API-level inspection, use:

```text
http://127.0.0.1:8000/docs
```

## Governance Considerations

MCP is intentionally treated as a governed capability layer:

1. The authenticated application determines the user context.
2. The Portfolio Agent requests explicit tools.
3. Tool responses are structured and bounded by application capabilities.
4. Gemini receives supplied context rather than unrestricted data access.
5. AI output is validated before display.
6. MCP execution telemetry is persisted for administrative visibility.

## Current Scope

The current MCP implementation supports the portfolio-intelligence prototype using project/sample data. Live market feeds, broker APIs, and order execution are outside the current scope.
