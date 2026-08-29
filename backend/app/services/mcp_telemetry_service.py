import time

from app.database.database import SessionLocal
from app.database.models import MCPExecutionRecord


def record_mcp_execution(
    execution_id,
    tool_name,
    status,
    duration_ms,
    error_message=None,
):
    """
    Persist MCP tool execution telemetry.
    """

    db = SessionLocal()

    try:
        record = MCPExecutionRecord(
            execution_id=execution_id,
            tool_name=tool_name,
            status=status,
            duration_ms=duration_ms,
            error_message=error_message,
            input_source="MCP",
        )

        db.add(record)
        db.commit()

    finally:
        db.close()


async def execute_mcp_tool(
    session,
    tool_name,
    execution_id,
    arguments=None,
):
    """
    Execute an MCP tool while recording
    execution telemetry.

    Arguments are passed to the MCP tool when
    supplied. This allows portfolio-dependent
    tools to operate on a specific user.
    """

    start_time = time.perf_counter()

    try:

        if arguments is None:
            arguments = {}

        result = await session.call_tool(
            tool_name,
            arguments=arguments,
        )

        duration_ms = (
            time.perf_counter() - start_time
        ) * 1000

        record_mcp_execution(
            execution_id=execution_id,
            tool_name=tool_name,
            status="SUCCESS",
            duration_ms=round(
                duration_ms,
                2,
            ),
        )

        return result

    except Exception as exc:

        duration_ms = (
            time.perf_counter() - start_time
        ) * 1000

        record_mcp_execution(
            execution_id=execution_id,
            tool_name=tool_name,
            status="FAILED",
            duration_ms=round(
                duration_ms,
                2,
            ),
            error_message=str(exc),
        )

        raise