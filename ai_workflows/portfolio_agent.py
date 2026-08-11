import os
import json
import sys
from pathlib import Path

from dotenv import load_dotenv
from google import genai

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


# --------------------------------------------------
# Project paths
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[1]

MCP_SERVER_PATH = (
    PROJECT_ROOT
    / "mcp_server"
    / "server.py"
)


# --------------------------------------------------
# Environment variables
# --------------------------------------------------

load_dotenv(PROJECT_ROOT / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.1-flash-lite",
)


# --------------------------------------------------
# Gemini client
# --------------------------------------------------

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# --------------------------------------------------
# MCP server parameters
# --------------------------------------------------

server_params = StdioServerParameters(
    command=sys.executable,
    args=[
        str(MCP_SERVER_PATH)
    ],
)


# --------------------------------------------------
# Helper function
# --------------------------------------------------

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


# --------------------------------------------------
# Get portfolio context through MCP
# --------------------------------------------------

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

            # --------------------------------------
            # Discover available tools
            # --------------------------------------

            tools_result = await session.list_tools()

            available_tools = [
                tool.name
                for tool in tools_result.tools
            ]

            print(
                "MCP tools available:",
                available_tools
            )

            # --------------------------------------
            # Call MCP tools
            # --------------------------------------

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

            # --------------------------------------
            # Build structured context
            # --------------------------------------

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


# --------------------------------------------------
# Gemini analysis
# --------------------------------------------------

def generate_ai_analysis(context):
    """
    Send MCP-derived portfolio context to Gemini.
    """

    prompt = f"""
You are an AI financial intelligence assistant.

Analyze the portfolio using ONLY the portfolio
data and analytics provided below.

IMPORTANT RULES:

1. Use only the portfolio data and analytics
   provided below.

2. Do not infer or introduce company sectors,
   industries, market conditions, news, analyst
   opinions, earnings information, or other
   external facts unless explicitly provided.

3. Every factual claim about the portfolio must
   be traceable to a value in the supplied data
   or calculated analytics.

4. Do not invent prices, returns, financial results,
   or other portfolio information.

5. Do not execute trades.

6. Do not present the response as guaranteed
   financial advice.

7. Clearly distinguish portfolio facts from
   observations.

8. Explain the data supporting each important
   observation.

9. Keep the response practical and understandable.

Portfolio context retrieved through MCP:

{json.dumps(context, indent=4)}

Provide your analysis using these sections:

1. Portfolio Overview
2. Key Observations
3. Risk Analysis
4. Performance Highlights
5. Diversification Considerations

End with a short disclaimer that the analysis is
informational and not financial advice.
"""

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
    )

    return response.text


# --------------------------------------------------
# Main workflow
# --------------------------------------------------

async def main():

    print()
    print("=" * 60)
    print("Connecting to MCP server...")
    print("=" * 60)

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

    print()
    print("=" * 60)
    print("GENERATING AI ANALYSIS")
    print("=" * 60)

    analysis = generate_ai_analysis(
        context
    )

    print()
    print(analysis)

    print()
    print("=" * 60)
    print("AI WORKFLOW COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
