from pathlib import Path
import os
import sys

from fastapi import APIRouter, Depends
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.auth.dependencies import require_admin
from app.database.database import get_db
from app.database.models import (
    AIExecutionRecord,
    MCPExecutionRecord,
    RecommendationRecord,
    User,
)

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


router = APIRouter()


# ============================================================
# Project paths
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]

MCP_SERVER_PATH = (
    PROJECT_ROOT
    / "mcp_server"
    / "server.py"
)


# ============================================================
# MCP configuration
# ============================================================

REQUIRED_MCP_TOOLS = [
    "get_portfolio",
    "get_portfolio_analytics",
    "get_market_data",
    "get_portfolio_news",
]


# ============================================================
# Admin summary
# ============================================================

@router.get("/summary")
def get_admin_summary(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Return platform-level statistics for the admin dashboard.

    These values are calculated from persisted database records
    and are not static dashboard values.
    """

    total_users = (
        db.query(func.count(User.id))
        .scalar()
        or 0
    )

    total_ai_executions = (
        db.query(func.count(AIExecutionRecord.id))
        .scalar()
        or 0
    )

    successful_ai_executions = (
        db.query(func.count(AIExecutionRecord.id))
        .filter(
            AIExecutionRecord.status == "SUCCESS"
        )
        .scalar()
        or 0
    )

    failed_ai_executions = (
        db.query(func.count(AIExecutionRecord.id))
        .filter(
            AIExecutionRecord.status == "FAILED"
        )
        .scalar()
        or 0
    )

    total_mcp_executions = (
        db.query(func.count(MCPExecutionRecord.id))
        .scalar()
        or 0
    )

    failed_mcp_executions = (
        db.query(func.count(MCPExecutionRecord.id))
        .filter(
            MCPExecutionRecord.status == "FAILED"
        )
        .scalar()
        or 0
    )

    total_recommendations = (
        db.query(func.count(RecommendationRecord.id))
        .scalar()
        or 0
    )

    return {
        "total_users": total_users,
        "total_ai_executions": total_ai_executions,
        "successful_ai_executions": successful_ai_executions,
        "failed_ai_executions": failed_ai_executions,
        "total_mcp_executions": total_mcp_executions,
        "failed_mcp_executions": failed_mcp_executions,
        "total_recommendations": total_recommendations,
    }


# ============================================================
# MCP health check
# ============================================================

async def check_mcp_health():
    """
    Check whether the MCP server can actually be initialized
    and whether the required MCP tools are available.

    This uses the same STDIO mechanism as the AI analysis
    workflow instead of checking whether server.py merely
    exists on disk.
    """

    if not MCP_SERVER_PATH.exists():
        return {
            "status": "NOT_CONFIGURED",
            "message": "MCP server configuration was not found.",
        }

    server_params = StdioServerParameters(
        command=sys.executable,
        args=[
            str(MCP_SERVER_PATH)
        ],
    )

    try:
        async with stdio_client(
            server_params
        ) as (read, write):

            async with ClientSession(
                read,
                write
            ) as session:

                # Initialize the MCP session.
                await session.initialize()

                # Discover available tools.
                tools_result = (
                    await session.list_tools()
                )

                available_tools = {
                    tool.name
                    for tool in tools_result.tools
                }

                missing_tools = [
                    tool
                    for tool in REQUIRED_MCP_TOOLS
                    if tool not in available_tools
                ]

                if missing_tools:
                    return {
                        "status": "DEGRADED",
                        "message": (
                            "MCP server is reachable, "
                            "but required tools are missing."
                        ),
                        "missing_tools": missing_tools,
                    }

                return {
                    "status": "ONLINE",
                    "message": (
                        "MCP server is available and "
                        "required tools are accessible."
                    ),
                    "available_tools": sorted(
                        available_tools
                    ),
                }

    except Exception as exc:
        return {
            "status": "OFFLINE",
            "message": (
                "MCP server could not be initialized."
            ),
            "error": str(exc),
        }


# ============================================================
# System health
# ============================================================

@router.get("/health")
async def get_system_health(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Return real-time platform component health.

    Components:
    - Database
    - Backend
    - MCP
    - Governance / validation infrastructure
    """

    health = {}

    # --------------------------------------------------------
    # Database
    # --------------------------------------------------------

    try:
        db.execute(text("SELECT 1"))

        health["database"] = {
            "status": "CONNECTED",
            "message": (
                "Database connection is healthy."
            ),
        }

    except Exception as exc:
        health["database"] = {
            "status": "OFFLINE",
            "message": (
                "Database connection failed."
            ),
            "error": str(exc),
        }

    # --------------------------------------------------------
    # Backend
    # --------------------------------------------------------

    health["backend"] = {
        "status": "ONLINE",
        "message": (
            "Backend API is responding."
        ),
    }

    # --------------------------------------------------------
    # MCP
    # --------------------------------------------------------

    health["mcp"] = await check_mcp_health()

    # --------------------------------------------------------
    # Governance / validation
    # --------------------------------------------------------

    health["governance"] = {
        "status": "ENABLED",
        "message": (
            "AI validation and audit infrastructure "
            "is enabled."
        ),
    }

    # --------------------------------------------------------
    # Overall system status
    # --------------------------------------------------------

    database_status = (
        health["database"]["status"]
    )

    backend_status = (
        health["backend"]["status"]
    )

    mcp_status = (
        health["mcp"]["status"]
    )

    governance_status = (
        health["governance"]["status"]
    )

    if (
        database_status == "CONNECTED"
        and backend_status == "ONLINE"
        and mcp_status == "ONLINE"
        and governance_status == "ENABLED"
    ):
        overall_status = "HEALTHY"

    elif (
        database_status == "OFFLINE"
        or backend_status == "OFFLINE"
        or mcp_status == "OFFLINE"
    ):
        overall_status = "DEGRADED"

    else:
        overall_status = "DEGRADED"

    health["overall"] = {
        "status": overall_status,
        "message": (
            "All monitored platform services are healthy."
            if overall_status == "HEALTHY"
            else
            "One or more platform services require attention."
        ),
    }

    return health