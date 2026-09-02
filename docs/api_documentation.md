# API Documentation

The backend is implemented with FastAPI and exposes REST endpoints under `/api`.

For interactive request/response exploration, run the backend and open `/docs` for Swagger UI or `/openapi.json` for the OpenAPI schema.

## Authentication

### `POST /api/auth/login`

Authenticates a user and returns an access token.

**Request**

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Behavior**

- Verifies the supplied password against the stored bcrypt hash.
- Creates a JWT access token containing the authenticated user identity and role.
- The token is used as a Bearer token for protected endpoints.

### `GET /api/auth/me`

Returns the currently authenticated user's information.

**Authentication:** Required.

## Portfolio APIs

### `GET /api/portfolio/`

Returns portfolio holdings belonging to the authenticated user.

**Authentication:** Required.

### `GET /api/portfolio/summary`

Returns portfolio-level metrics including total investment, current value, profit, return percentage, best performer, and worst performer.

**Authentication:** Required.

### `GET /api/portfolio/allocation`

Returns current-value allocation by holding.

**Authentication:** Required.

### `GET /api/portfolio/risk`

Returns portfolio concentration/risk information, including the largest holding and its allocation.

**Authentication:** Required.

### `GET /api/portfolio/performance`

Returns holding-level investment, current value, profit, and return percentage.

**Authentication:** Required.

### `POST /api/portfolio/upload`

Accepts portfolio upload data and processes it for the authenticated user's portfolio workflow.

**Authentication:** Required.

## AI Insights

### `GET /api/insights/`

Returns deterministic portfolio insights based on the authenticated user's portfolio, summary, risk, and performance data.

**Authentication:** Required.

### `GET /api/insights/ai`

Runs the controlled Portfolio Agent workflow and returns structured AI portfolio intelligence.

**Authentication:** Required.

The workflow includes portfolio/analytics context retrieval, MCP tool usage, Gemini interpretation, output validation, and execution telemetry.

## Recommendations

### `GET /api/recommendations`

Returns the latest recommendation generation belonging to the authenticated user.

**Authentication:** Required.

Each recommendation includes its `generation_id`, allowing user feedback to be associated with the exact generated recommendation set.

### `POST /api/recommendations/generate`

Generates recommendation signals from portfolio analytics and stores the resulting recommendation records for the authenticated user.

**Authentication:** Required.

Recommendations include structured fields such as generation ID, type, title, rationale, supporting metrics, confidence, data source, and disclaimer.

## Recommendation Feedback

### `POST /api/feedback`

Stores whether an authenticated user found a recommendation useful.

**Authentication:** Required.

**Request**

```json
{
  "generation_id": "<recommendation-generation-id>",
  "recommendation_type": "concentration",
  "rating": "HELPFUL"
}
```

Supported ratings:

```text
HELPFUL
NOT_HELPFUL
```

### `GET /api/feedback`

Returns feedback submitted by the authenticated user.

**Authentication:** Required.

Feedback is user-scoped and does not expose another user's feedback through the normal API.

## Analytics APIs

### `GET /api/analytics/summary`

Returns portfolio summary analytics.

### `GET /api/analytics/allocation`

Returns allocation analytics.

### `GET /api/analytics/risk`

Returns concentration/risk analytics.

### `GET /api/analytics/performance`

Returns holding-level performance analytics.

### `GET /api/analytics/contribution`

Returns stock-level contribution to portfolio profit/loss.

**Authentication:** Required for analytics endpoints.

## Audit APIs

### `GET /api/audit/executions`

Returns AI execution records for administrative operational review.

**Authentication:** Required. **ADMIN role required.**

### `GET /api/audit/mcp-executions`

Returns MCP execution records for administrative operational review.

**Authentication:** Required. **ADMIN role required.**

## Admin APIs

### `GET /api/admin/summary`

Returns administrative metrics such as user count, AI execution activity, successful/failed AI executions, MCP execution activity, failed MCP executions, and recommendation counts.

**Authentication:** Required. **ADMIN role required.**

### `GET /api/admin/health`

Returns health information for the backend, database, MCP layer, and governance/validation components.

**Authentication:** Required. **ADMIN role required.**

## Authentication Header

Protected requests use:

```text
Authorization: Bearer <access_token>
```

## Error Handling

The API uses standard HTTP status codes for authentication, authorization, validation, not-found, and server-side failures. Exact response schemas can be inspected through the generated OpenAPI documentation.

## API Design Principles

- Authentication is enforced at the backend boundary.
- Portfolio, recommendation, and feedback data is scoped to the authenticated user.
- Administrative telemetry is restricted to ADMIN users.
- Financial calculations are performed deterministically.
- AI-generated output passes application-level validation before presentation.
- Secrets are supplied through environment variables rather than API payloads or source code.

## Local API Documentation

Start the backend with:

```bash
uvicorn app.main:app --reload
```

Then open:

```text
http://127.0.0.1:8000/docs
```

## Deployed API

The deployed backend is available at the project deployment URL listed in the root README. Swagger UI is available at `/docs` on the deployed backend.
