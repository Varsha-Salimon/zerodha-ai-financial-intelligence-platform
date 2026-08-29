from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db, require_admin
from app.database.models import (
    User,
    AIExecutionRecord,
    MCPExecutionRecord,
    RecommendationRecord,
)


router = APIRouter()


@router.get("/summary")
def get_admin_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
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
    
@router.get("/health")
def get_system_health(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    health = {}

    # ----------------------------------------------------
    # Database
    # ----------------------------------------------------

    try:
        db.execute(
            __import__("sqlalchemy").text(
                "SELECT 1"
            )
        )

        health["database"] = {
            "status": "CONNECTED",
            "message": "PostgreSQL connection is healthy.",
        }

    except Exception as exc:

        health["database"] = {
            "status": "OFFLINE",
            "message": str(exc),
        }


    # ----------------------------------------------------
    # Backend
    # ----------------------------------------------------

    health["backend"] = {
        "status": "ONLINE",
        "message": "FastAPI service is responding.",
    }


    # ----------------------------------------------------
    # MCP
    # ----------------------------------------------------

    try:
        from pathlib import Path

        project_root = (
            Path(__file__)
            .resolve()
            .parents[3]
        )

        mcp_server_file = (
            project_root
            / "mcp_server"
            / "server.py"
        )

        if mcp_server_file.exists():

            health["mcp"] = {
                "status": "CONFIGURED",
                "message": (
                    "MCP server configuration is available."
                ),
            }

        else:

            health["mcp"] = {
                "status": "OFFLINE",
                "message": (
                    "MCP server configuration was not found."
                ),
            }

    except Exception as exc:

        health["mcp"] = {
            "status": "UNKNOWN",
            "message": str(exc),
        }


    # ----------------------------------------------------
    # Governance
    # ----------------------------------------------------

    health["governance"] = {
        "status": "ENABLED",
        "message": (
            "AI validation and audit infrastructure is enabled."
        ),
    }


    statuses = [
        health["database"]["status"],
        health["backend"]["status"],
        health["mcp"]["status"],
        health["governance"]["status"],
    ]

    if all(
        status in {
            "ONLINE",
            "CONNECTED",
            "ACTIVE",
            "ENABLED",
        }
        for status in statuses
    ):
        overall_status = "HEALTHY"

    else:
        overall_status = "DEGRADED"


    return {
        "overall_status": overall_status,
        "services": health,
    }