const BASE_URL = "http://127.0.0.1:8000";

export async function getPortfolio() {
  const response = await fetch(
    `${BASE_URL}/api/portfolio`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch portfolio data");
  }

  return response.json();
}

export async function getPortfolioSummary() {
  const response = await fetch(
    `${BASE_URL}/api/portfolio/summary`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch portfolio summary");
  }

  return response.json();
}

export async function getPortfolioAllocation() {
  const response = await fetch(
    `${BASE_URL}/api/portfolio/allocation`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch portfolio allocation"
    );
  }

  return response.json();
}

export async function getPortfolioRisk() {
  const response = await fetch(
    `${BASE_URL}/api/portfolio/risk`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch portfolio risk"
    );
  }

  return response.json();
}

export async function getPortfolioPerformance() {
  const response = await fetch(
    `${BASE_URL}/api/portfolio/performance`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch portfolio performance"
    );
  }

  return response.json();
}

export async function getInsights() {
  const response = await fetch(
    `${BASE_URL}/api/insights/`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch AI insights");
  }

  return response.json();
}

export async function getAIAnalysis() {
  const response = await fetch(
    `${BASE_URL}/api/insights/ai`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch AI analysis");
  }

  return response.json();
}

export async function getRecommendations() {
  const response = await fetch(
    `${BASE_URL}/api/recommendations`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recommendations");
  }

  return response.json();
}

export async function generateRecommendations() {
  const response = await fetch(
    `${BASE_URL}/api/recommendations/generate`,
    {
      method: "POST",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to generate recommendations"
    );
  }

  return response.json();
}

export async function getAIExecutions() {
  const response = await fetch(
    `${BASE_URL}/api/audit/executions`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch AI execution records"
    );
  }

  return response.json();
}

export async function getMCPExecutions() {
  const response = await fetch(
    `${BASE_URL}/api/audit/mcp-executions`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch MCP executions"
    );
  }

  return response.json();
}