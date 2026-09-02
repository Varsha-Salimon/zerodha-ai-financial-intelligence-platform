# Project Documentation

This directory contains supporting documentation for the Zerodha AI Financial Intelligence Platform.

## Documentation Index

- [`architecture.md`](architecture.md) — system architecture, component responsibilities, request flow, security boundaries, and design trade-offs.
- [`api_documentation.md`](api_documentation.md) — REST API areas, authentication requirements, and endpoint behavior.
- [`mcp.md`](mcp.md) — MCP purpose, available tools, data flow, user scoping, configuration, and governance.
- [`demo_script.md`](demo_script.md) — recommended end-to-end product and technical demonstration flow.
- [`screenshots/`](screenshots/) — screenshots of the implemented investor and administrative product surfaces.

## Technology Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, Pydantic
- **Database:** PostgreSQL, SQLAlchemy
- **AI:** Google Gemini API
- **AI integration:** Model Context Protocol (MCP) and a controlled Portfolio Agent workflow
- **Authentication:** bcrypt, JWT, role-based access control
- **Deployment:** Render

## Scope

The documentation describes the current prototype implementation. The application uses sample portfolio, market, and news data and does not execute trades. Live brokerage integrations, real-time market feeds, advanced risk models, and production-scale observability are future extensions.
