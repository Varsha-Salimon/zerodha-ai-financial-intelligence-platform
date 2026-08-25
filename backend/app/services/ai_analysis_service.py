import os
import json
import sys
import uuid
from pathlib import Path

from app.schemas.ai_analysis_schema import AIAnalysis
from app.services.validation_service import validate_ai_analysis
from app.services.mcp_telemetry_service import (
    execute_mcp_tool,
)
from app.database.database import SessionLocal
from app.database.models import AIExecutionRecord
from dotenv import load_dotenv
from google import genai

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


# ============================================================
# Project paths
# ============================================================

# ai_analysis_service.py
# backend/app/services/ai_analysis_service.py

PROJECT_ROOT = Path(__file__).resolve().parents[3]

MCP_SERVER_PATH = (
    PROJECT_ROOT
    / "mcp_server"
    / "server.py"
)


# ============================================================
# Environment variables
# ============================================================

load_dotenv(PROJECT_ROOT / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.1-flash-lite",
)

if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY is not configured in the .env file."
    )


# ============================================================
# Gemini client
# ============================================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ============================================================
# MCP server parameters
# ============================================================

server_params = StdioServerParameters(
    command=sys.executable,
    args=[
        str(MCP_SERVER_PATH)
    ],
)


# ============================================================
# Helper: Extract MCP result
# ============================================================

def extract_mcp_result(result):
    """
    Convert MCP tool output into Python data.
    """

    if not result.content:
        return None

    text = result.content[0].text

    try:
        return json.loads(text)

    except json.JSONDecodeError:
        return text


# ============================================================
# Get portfolio context through MCP
# ============================================================

async def get_portfolio_context():
    """
    Connect to the MCP server and retrieve
    portfolio information through MCP tools.
    """

    execution_id = str(uuid.uuid4())
    
    async with stdio_client(
        server_params
    ) as (read, write):

        async with ClientSession(
            read,
            write
        ) as session:

            await session.initialize()

            # ------------------------------------------------
            # Discover available MCP tools
            # ------------------------------------------------

            tools_result = await session.list_tools()

            available_tools = [
                tool.name
                for tool in tools_result.tools
            ]

            required_tools = [
                "get_portfolio",
                "get_portfolio_analytics",
                "get_market_data",
                "get_portfolio_news",
            ]

            missing_tools = [
                tool
                for tool in required_tools
                if tool not in available_tools
            ]

            if missing_tools:
                raise RuntimeError(
                    f"Required MCP tools are missing: {missing_tools}"
                )

            # ------------------------------------------------
            # Call MCP tools
            # ------------------------------------------------

            portfolio_result = await execute_mcp_tool(
                session,
                "get_portfolio",
                execution_id,
            )

            analytics_result = await execute_mcp_tool(
                session,
                "get_portfolio_analytics",
                execution_id,
            )

            market_result = await execute_mcp_tool(
                session,
                "get_market_data",
                execution_id,
            )

            news_result = await execute_mcp_tool(
                session,
                "get_portfolio_news",
                execution_id,
            )   

            # ------------------------------------------------
            # Build structured context
            # ------------------------------------------------

            context = {
                "portfolio": extract_mcp_result(
                    portfolio_result
                ),

                "analytics": extract_mcp_result(
                    analytics_result
                ),
                
                "market": extract_mcp_result(
                    market_result
                ),

                "news": extract_mcp_result(
                    news_result
                ),
            }

            return context


# ============================================================
# Gemini AI analysis
# ============================================================

def generate_ai_analysis(context):
    """
    Send MCP-derived portfolio context to Gemini
    and return structured JSON analysis.
    """

    prompt = f"""
You are an AI financial intelligence assistant
for a portfolio analysis application.

Analyze the portfolio using ONLY the portfolio
data and analytics provided below.

IMPORTANT RULES:

1. Use only the supplied portfolio data and
   deterministic analytics.

2. Every factual statement about the portfolio
   must be directly traceable to the supplied data.

3. Do not introduce external market information
   that is not present in the supplied context.

4. Do not invent prices, quantities, returns,
   profits, allocations, sectors, risk levels,
   volatility, drawdown, benchmark values,
   timestamps, or other portfolio information.

5. Use supplied numeric values exactly where
   applicable.

6. Do not calculate or introduce additional
   metrics unless they can be derived directly
   from the supplied data.

7. You may explain relationships between supplied
   analytics, but clearly distinguish facts from
   observations.

8. Do not execute trades.

9. Do not give guaranteed financial advice.

10. Do not recommend a specific stock purchase
    or sale.

11. For performance highlights, use the holdings
    contained in the supplied performance data.

12. Sector observations may be made only when
    sector information is present in the supplied
    analytics.

13. Benchmark observations may be made only using
    the supplied benchmark comparison.

14. Volatility and drawdown observations may be
    made only using the supplied analytics.

15. Data freshness statements must use only the
    supplied freshness information.

16. Return ONLY valid JSON.

17. Do not use Markdown.

18. Do not wrap the JSON in a code block.

19. Do not add any text before or after the JSON.

20. News headlines must be reproduced accurately when
    referenced.

21. Do not invent information beyond the supplied
    headline.

22. Do not infer earnings amounts, analyst expectations,
    guidance, future performance, sentiment scores,
    or market reactions unless explicitly supplied.

23. Market context entries must correspond only to
    stocks present in the supplied portfolio.

24. The market_context list must contain only news
    available from the supplied MCP news context.

25. If no relevant news exists, return an empty
    market_context list.

26. Do not use special Unicode punctuation or symbols.
    Use standard ASCII punctuation only.

Portfolio, deterministic analytics, market data,
and portfolio-relevant news retrieved through MCP:

{json.dumps(context, indent=4)}

Return exactly this JSON structure:

{{
    "portfolio_overview": "A concise factual overview of the portfolio.",

    "key_observations": [
        "Observation 1",
        "Observation 2",
        "Observation 3"
    ],

    "risk_analysis": {{
        "risk_level": "MEDIUM",
        "summary": "Explain portfolio risk using only the supplied analytics."
    }},

    "performance_highlights": [
        {{
            "stock": "TCS",
            "return_percentage": 6.47,
            "profit": 4400,
            "observation": "Brief observation based only on supplied performance data."
        }}
    ],

    "diversification_considerations": [
        "Consideration 1",
        "Consideration 2"
    ],
    
    "market_context": [
        {{
            "stock": "TCS",
            "headline": "Strong quarterly earnings",
            "observation": "The supplied news context reports strong quarterly earnings for TCS."
        }}
    ],

    "disclaimer": "This analysis is for informational purposes only and does not constitute financial or investment advice."
}}

Additional requirements:

- The number of performance_highlights entries
  must match the number of holdings in the
  supplied performance data.
  
- The number of market_context entries must equal
  the number of portfolio-relevant news records
  supplied by MCP.

- Use the actual stock names and headlines from
  the supplied MCP news context.

- Use the actual stock names, return percentages,
  and profits from the supplied performance data.

- The risk_level must match the supplied risk
  analysis.

- Do not change or reinterpret the supplied
  risk_level.

- Keep the language concise, practical, and
  understandable.
"""

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
    )

    response_text = response.text.strip()

    try:
        parsed_response = json.loads(response_text)

        validated_analysis = AIAnalysis.model_validate(
            parsed_response
        )

        return validated_analysis.model_dump()

    except json.JSONDecodeError:

        return {
            "error": "Gemini returned an invalid JSON response.",
            "raw_response": response_text,
        }

    except Exception as exc:

        return {
            "error": "Gemini response failed schema validation.",
            "details": str(exc),
            "raw_response": response_text,
        }                       


# ============================================================
# Main service function
# ============================================================

async def generate_portfolio_ai_analysis():
    """
    Complete AI portfolio analysis workflow with
    validation and persistent audit logging.
    """

    execution_id = str(uuid.uuid4())

    db = SessionLocal()

    try:
        # ----------------------------------------------------
        # Create initial execution record
        # ----------------------------------------------------

        execution_record = AIExecutionRecord(
            execution_id=execution_id,
            workflow="portfolio_ai_analysis",
            model=GEMINI_MODEL,
            status="RUNNING",
            validation_status="PENDING",
            input_source="MCP portfolio, analytics, market, and news",
        )

        db.add(execution_record)
        db.commit()

        # ----------------------------------------------------
        # Retrieve MCP context
        # ----------------------------------------------------

        context = await get_portfolio_context()

        # ----------------------------------------------------
        # Generate Gemini analysis
        # ----------------------------------------------------

        analysis = generate_ai_analysis(
            context
        )

        # ----------------------------------------------------
        # Handle Gemini/schema errors
        # ----------------------------------------------------

        if "error" in analysis:

            execution_record.status = "FAILED"
            execution_record.validation_status = "FAILED"

            execution_record.output_summary = {
                "error": analysis.get("error")
            }

            execution_record.validation_details = {
                "details": analysis.get("details")
            }

            db.commit()

            return analysis

        # ----------------------------------------------------
        # Grounding and policy validation
        # ----------------------------------------------------

        validation = validate_ai_analysis(
            analysis,
            context,
        )

        execution_record.validation_details = validation

        if not validation["valid"]:

            execution_record.status = "REJECTED"
            execution_record.validation_status = "FAILED"

            execution_record.output_summary = {
                "error": "AI analysis failed validation."
            }

            db.commit()

            return {
                "error": "AI analysis failed validation.",
                "validation": validation,
            }

        # ----------------------------------------------------
        # Successful execution
        # ----------------------------------------------------

        execution_record.status = "SUCCESS"
        execution_record.validation_status = "PASSED"

        execution_record.output_summary = {
            "portfolio_overview":
                analysis.get("portfolio_overview"),

            "observation_count":
                len(
                    analysis.get(
                        "key_observations",
                        [],
                    )
                ),

            "performance_highlight_count":
                len(
                    analysis.get(
                        "performance_highlights",
                        [],
                    )
                ),
        }

        db.commit()

        return analysis

    except Exception as exc:

        db.rollback()

        # Try to persist failure state
        try:
            execution_record.status = "FAILED"
            execution_record.validation_status = "FAILED"

            execution_record.validation_details = {
                "error": str(exc)
            }

            db.commit()

        except Exception:
            db.rollback()

        raise

    finally:
        db.close()