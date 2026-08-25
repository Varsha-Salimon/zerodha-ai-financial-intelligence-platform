import os
import json
import sys
from pathlib import Path

from dotenv import load_dotenv
from google import genai

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


# ============================================================
# Project paths
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

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

            print(
                "MCP tools available:",
                available_tools
            )

            # ------------------------------------------------
            # Call MCP tools
            # ------------------------------------------------

            portfolio_result = await session.call_tool(
                "get_portfolio"
            )

            summary_result = await session.call_tool(
                "get_portfolio_summary"
            )

            allocation_result = await session.call_tool(
                "get_portfolio_allocation"
            )

            risk_result = await session.call_tool(
                "get_portfolio_risk"
            )

            performance_result = await session.call_tool(
                "get_portfolio_performance"
            )

            # ------------------------------------------------
            # Build structured portfolio context
            # ------------------------------------------------

            context = {
                "portfolio": extract_mcp_result(
                    portfolio_result
                ),

                "summary": extract_mcp_result(
                    summary_result
                ),

                "allocation": extract_mcp_result(
                    allocation_result
                ),

                "risk": extract_mcp_result(
                    risk_result
                ),

                "performance": extract_mcp_result(
                    performance_result
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
   calculated analytics.

2. Every factual statement about the portfolio
   must be directly traceable to the supplied data.

3. Do not introduce external market information.

4. Do not introduce company sectors, industries,
   market conditions, news, analyst opinions,
   earnings information, or other external facts
   unless they are explicitly present in the data.

5. Do not invent prices, quantities, returns,
   profits, allocations, risk levels, or other
   portfolio information.

6. Use supplied numeric values exactly where
   applicable.

7. Do not calculate or introduce additional
   metrics unless they can be derived directly
   from the supplied data.

8. Do not execute trades.

9. Do not give guaranteed financial advice.

10. Clearly distinguish portfolio facts from
    observations or considerations.

11. Do not recommend a specific stock purchase
    or sale.

12. For performance highlights, use the holdings
    contained in the supplied performance data.

13. Do not mention sectors because sector
    information is not provided.

14. Return ONLY valid JSON.

15. Do not use Markdown.

16. Do not wrap the JSON in code fences.

17. Do not add any text before or after the JSON.

Portfolio context retrieved through MCP:

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
        "summary": "Explain the portfolio risk using only the supplied risk data."
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

    "disclaimer": "This analysis is for informational purposes only and does not constitute financial or investment advice."
}}

Additional requirements:

- The number of performance_highlights entries
  must match the number of holdings in the
  supplied performance data.

- Use the actual stock names, return percentages,
  and profits from the supplied performance data.

- The risk_level must exactly match the supplied
  risk analysis.

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

    # --------------------------------------------------------
    # Remove accidental Markdown code fences
    # --------------------------------------------------------

    if response_text.startswith("```"):
        response_text = response_text.replace(
            "```json",
            "",
            1
        ).replace(
            "```",
            "",
            1
        ).strip()

    # --------------------------------------------------------
    # Parse JSON
    # --------------------------------------------------------

    try:
        return json.loads(response_text)

    except json.JSONDecodeError:

        return {
            "error": "Gemini returned an invalid JSON response.",
            "raw_response": response_text,
        }


# ============================================================
# Main AI workflow
# ============================================================

async def main():

    print()
    print("=" * 60)
    print("Connecting to MCP server...")
    print("=" * 60)

    # --------------------------------------------------------
    # Retrieve portfolio data through MCP
    # --------------------------------------------------------

    context = await get_portfolio_context()

    print()
    print("=" * 60)
    print("MCP PORTFOLIO CONTEXT RETRIEVED")
    print("=" * 60)

    print(
        json.dumps(
            context,
            indent=4
        )
    )

    # --------------------------------------------------------
    # Generate Gemini analysis
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("GENERATING AI ANALYSIS")
    print("=" * 60)

    analysis = generate_ai_analysis(
        context
    )

    # --------------------------------------------------------
    # Display final structured AI response
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("AI ANALYSIS")
    print("=" * 60)

    print(
        json.dumps(
            analysis,
            indent=4,
            ensure_ascii=False
        )
    )

    print()
    print("=" * 60)
    print("AI WORKFLOW COMPLETE")
    print("=" * 60)


# ============================================================
# Application entry point
# ============================================================

if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
