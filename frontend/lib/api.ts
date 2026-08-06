const BASE_URL = "http://127.0.0.1:8000";

export async function getPortfolio() {
  const response = await fetch(`${BASE_URL}/api/portfolio`);

  if (!response.ok) {
    throw new Error("Failed to fetch portfolio data");
  }

  return response.json();
}