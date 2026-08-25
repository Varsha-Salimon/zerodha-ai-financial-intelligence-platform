from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import AIExecutionRecord


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