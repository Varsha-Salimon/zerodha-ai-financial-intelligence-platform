const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

interface PortfolioUploadResponse {
  message: string;
  holdings_added: number;
  stocks_added: string[];
}
/*
 * Get the JWT access token stored during login.
 *
 * localStorage is only available in the browser,
 * so we check for window before accessing it.
 */
function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}


/*
 * Common authenticated request helper.
 *
 * Every protected backend request goes through this function.
 */
async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Authentication required. Please log in again."
    );
  }

  const headers = new Headers(
    options.headers
  );

  headers.set(
    "Authorization",
    `Bearer ${token}`
  );

  /*
   * Only set JSON Content-Type when a request body exists
   * AND the body is not FormData.
   *
   * For FormData uploads, the browser must automatically
   * set the multipart/form-data boundary.
   */
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  /*
   * If the token is expired or invalid,
   * remove the stored authentication data.
   */
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem("user");
    }

    throw new Error(
      "Your session has expired. Please log in again."
    );
  }

  return response;
}


/* =========================================================
   PORTFOLIO
   ========================================================= */

export async function getPortfolio() {
  const response =
    await authenticatedFetch(
      "/api/portfolio/"
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch portfolio data"
    );
  }

  return response.json();
}


export async function getPortfolioSummary() {
  const response =
    await authenticatedFetch(
      "/api/portfolio/summary"
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch portfolio summary"
    );
  }

  return response.json();
}


export async function getPortfolioAllocation() {
  const response =
    await authenticatedFetch(
      "/api/portfolio/allocation"
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch portfolio allocation"
    );
  }

  return response.json();
}


export async function getPortfolioRisk() {
  const response =
    await authenticatedFetch(
      "/api/portfolio/risk"
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch portfolio risk"
    );
  }

  return response.json();
}


export async function getPortfolioPerformance() {
  const response =
    await authenticatedFetch(
      "/api/portfolio/performance"
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch portfolio performance"
    );
  }

  return response.json();
}


/*
 * Upload portfolio CSV.
 *
 * The backend is responsible for:
 * - validating the CSV
 * - checking duplicate holdings
 * - associating holdings with the authenticated user
 * - adding the holdings to the existing portfolio
 */
export async function uploadPortfolio(
  file: File
): Promise<PortfolioUploadResponse> {
  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await authenticatedFetch(
      "/api/portfolio/upload",
      {
        method: "POST",
        body: formData,
        cache: "no-store",
      }
    );

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let errorMessage =
      "Failed to upload portfolio.";

    let detail: unknown = undefined;

    if (
      data &&
      typeof data === "object" &&
      "detail" in data
    ) {
      detail = (
        data as {
          detail?: unknown;
        }
      ).detail;
    }

    if (
      detail &&
      typeof detail === "object" &&
      "message" in detail
    ) {
      const message = (
        detail as {
          message?: unknown;
        }
      ).message;

      if (typeof message === "string") {
        errorMessage = message;
      }
    } else if (
      typeof detail === "string"
    ) {
      errorMessage = detail;
    }

    const error =
      new Error(errorMessage) as Error & {
        status?: number;
        detail?: unknown;
      };

    error.status = response.status;
    error.detail = detail;

    throw error;
  }

  return data as PortfolioUploadResponse;
}


/* =========================================================
   AI INSIGHTS
   ========================================================= */

export async function getInsights() {
  const response =
    await authenticatedFetch(
      "/api/insights/",
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch AI insights"
    );
  }

  return response.json();
}


export async function getAIAnalysis() {
  const response =
    await authenticatedFetch(
      "/api/insights/ai",
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch AI analysis"
    );
  }

  return response.json();
}


/* =========================================================
   RECOMMENDATIONS
   ========================================================= */

export async function getRecommendations() {
  const response =
    await authenticatedFetch(
      "/api/recommendations",
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch recommendations"
    );
  }

  return response.json();
}


export async function generateRecommendations() {
  const response =
    await authenticatedFetch(
      "/api/recommendations/generate",
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


/* =========================================================
   AUDIT / OPERATIONS
   ========================================================= */

export async function getAIExecutions() {
  const response =
    await authenticatedFetch(
      "/api/audit/executions",
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch AI execution records"
    );
  }

  const data =
    await response.json();

  return data.value ?? data;
}


export async function getMCPExecutions() {
  const response =
    await authenticatedFetch(
      "/api/audit/mcp-executions",
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch MCP executions"
    );
  }

  const data =
    await response.json();

  return data.value ?? data;
}


/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */

export async function getAdminSummary() {
  const response =
    await authenticatedFetch(
      "/api/admin/summary",
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch admin summary"
    );
  }

  return response.json();
}


export async function getSystemHealth() {
  const response =
    await authenticatedFetch(
      "/api/admin/health",
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch system health"
    );
  }

  return response.json();
}