from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import (
    AIExecutionRecord,
    MCPExecutionRecord,
)


router = APIRouter()


@router.get("/executions")
def get_ai_executions():
    """
    Return recent AI execution records for
    Operations and Compliance monitoring.
    """

    db: Session = SessionLocal()

    try:

        records = (
            db.query(AIExecutionRecord)
            .order_by(
                AIExecutionRecord.id.desc()
            )
            .all()
        )

        return [
            {
                "execution_id": record.execution_id,
                "workflow": record.workflow,
                "model": record.model,
                "status": record.status,
                "validation_status": (
                    record.validation_status
                ),
                "input_source": record.input_source,
                "output_summary": (
                    record.output_summary
                ),
                "validation_details": (
                    record.validation_details
                ),
            }
            for record in records
        ]

    finally:
        db.close()


@router.get("/mcp-executions")
def get_mcp_executions():
    """
    Return recent MCP tool execution records
    for Operations monitoring.
    """

    db: Session = SessionLocal()

    try:

        records = (
            db.query(MCPExecutionRecord)
            .order_by(
                MCPExecutionRecord.id.desc()
            )
            .all()
        )

        return [
            {
                "execution_id": record.execution_id,
                "tool_name": record.tool_name,
                "status": record.status,
                "duration_ms": record.duration_ms,
                "error_message": record.error_message,
                "input_source": record.input_source,
            }
            for record in records
        ]

    finally:
        db.close()