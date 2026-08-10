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
