"use client";

import { useEffect, useRef, useState } from "react";

import KPICard from "@/components/KPICard";
import PageHeader from "@/components/PageHeader";
import PortfolioTable from "@/components/PortfolioTable";
import PortfolioAllocation from "@/components/PortfolioAllocation";
import PortfolioRisk from "@/components/PortfolioRisk";
import PortfolioPerformance from "@/components/PortfolioPerformance";
import Pagination from "@/components/Pagination";

import {
  getPortfolio,
  getPortfolioSummary,
  getPortfolioAllocation,
  getPortfolioRisk,
  getPortfolioPerformance,
  uploadPortfolio,
} from "@/lib/api";

/* =========================================================
   CONSTANTS
   ========================================================= */

const ITEMS_PER_PAGE = 5;

/* =========================================================
   TYPES
   ========================================================= */

interface PortfolioItem {
  stock: string;
  quantity: number;
  avg_price: number;
  current_price: number;
}

interface PortfolioSummary {
  total_investment: number;
  current_value: number;
  profit: number;
  profit_percentage: number;
  best_performer: string;
  worst_performer: string;
}

interface PortfolioRisk {
  risk_level: string;
  largest_holding: string;
  largest_allocation: number;
  number_of_holdings: number;
  message: string;
}

interface PortfolioAllocationItem {
  stock: string;
  current_value: number;
  allocation_percentage: number;
}

interface PortfolioPerformanceItem {
  stock: string;
  investment: number;
  current_value: number;
  profit: number;
  return_percentage: number;
}

interface Holding {
  stock: string;
  quantity: number;
  avgPrice: string;
  currentPrice: string;
  pnl: string;
}

/* =========================================================
   HELPERS
   ========================================================= */

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    data &&
    typeof data === "object" &&
    "value" in data
  ) {
    const value = (
      data as {
        value?: unknown;
      }
    ).value;

    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function PortfolioPage() {
  /* =======================================================
     PORTFOLIO STATE
     ======================================================= */

  const [
    portfolioData,
    setPortfolioData,
  ] = useState<PortfolioItem[]>([]);

  const [
    portfolioSummary,
    setPortfolioSummary,
  ] = useState<PortfolioSummary | null>(
    null
  );

  const [
    portfolioAllocation,
    setPortfolioAllocation,
  ] = useState<
    PortfolioAllocationItem[]
  >([]);

  const [
    portfolioRisk,
    setPortfolioRisk,
  ] = useState<PortfolioRisk | null>(
    null
  );

  const [
    portfolioPerformance,
    setPortfolioPerformance,
  ] = useState<
    PortfolioPerformanceItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =======================================================
     UPLOAD STATE
     ======================================================= */

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    uploadError,
    setUploadError,
  ] = useState("");

  const [
    uploadSuccess,
    setUploadSuccess,
  ] = useState("");

  const [
    uploadDetails,
    setUploadDetails,
  ] = useState<string[]>([]);

  /*
   * Import Portfolio is collapsed by default.
   */
  const [
    uploadOpen,
    setUploadOpen,
  ] = useState(false);

  /* =======================================================
     PAGINATION STATE
     ======================================================= */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /* =======================================================
     LOAD PORTFOLIO
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadPortfolio() {
      try {
        setLoading(true);
        setError("");

        const [
          portfolioResponse,
          summaryResponse,
          allocationResponse,
          riskResponse,
          performanceResponse,
        ] = await Promise.all([
          getPortfolio(),
          getPortfolioSummary(),
          getPortfolioAllocation(),
          getPortfolioRisk(),
          getPortfolioPerformance(),
        ]);

        if (cancelled) {
          return;
        }

        setPortfolioData(
          extractArray<PortfolioItem>(
            portfolioResponse
          )
        );

        setPortfolioSummary(
          summaryResponse
        );

        setPortfolioAllocation(
          extractArray<PortfolioAllocationItem>(
            allocationResponse
          )
        );

        setPortfolioRisk(
          riskResponse
        );

        setPortfolioPerformance(
          extractArray<PortfolioPerformanceItem>(
            performanceResponse
          )
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load portfolio data."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     FILE SELECTION
     ======================================================= */

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    setUploadError("");
    setUploadSuccess("");
    setUploadDetails([]);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setSelectedFile(null);

      setUploadError(
        "Please select a CSV file."
      );

      event.target.value = "";

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setSelectedFile(null);

      setUploadError(
        "File size must be 5 MB or less."
      );

      event.target.value = "";

      return;
    }

    setSelectedFile(file);
  };

  /* =======================================================
     UPLOAD PORTFOLIO
     ======================================================= */

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError(
        "Please select a CSV file first."
      );

      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadSuccess("");
      setUploadDetails([]);

      const result =
        await uploadPortfolio(
          selectedFile
        );

      const stocksAdded =
        Array.isArray(
          result?.stocks_added
        )
          ? result.stocks_added
          : [];

      setUploadSuccess(
        result?.message ||
          "Portfolio uploaded successfully."
      );

      setUploadDetails(
        stocksAdded
      );

      /*
       * Clear selected file after
       * successful upload.
       */
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      /*
       * Return holdings table to page 1
       * because the portfolio has changed.
       */
      setCurrentPage(1);

      /*
       * Reload all portfolio-related data.
       *
       * This keeps:
       * - holdings
       * - KPI cards
       * - allocation
       * - risk
       * - performance
       *
       * synchronized with backend data.
       */
      const [
        portfolioResponse,
        summaryResponse,
        allocationResponse,
        riskResponse,
        performanceResponse,
      ] = await Promise.all([
        getPortfolio(),
        getPortfolioSummary(),
        getPortfolioAllocation(),
        getPortfolioRisk(),
        getPortfolioPerformance(),
      ]);

      setPortfolioData(
        extractArray<PortfolioItem>(
          portfolioResponse
        )
      );

      setPortfolioSummary(
        summaryResponse
      );

      setPortfolioAllocation(
        extractArray<PortfolioAllocationItem>(
          allocationResponse
        )
      );

      setPortfolioRisk(
        riskResponse
      );

      setPortfolioPerformance(
        extractArray<PortfolioPerformanceItem>(
          performanceResponse
        )
      );
    } catch (err) {
      const uploadErr =
        err as Error & {
          status?: number;
          detail?: unknown;
        };

      /*
       * Handle duplicate stocks.
       */
      if (
        uploadErr.status === 409 &&
        uploadErr.detail &&
        typeof uploadErr.detail === "object"
      ) {
        const detail =
          uploadErr.detail as {
            duplicate_stocks?: string[];
            message?: string;
          };

        const duplicates =
          Array.isArray(
            detail.duplicate_stocks
          )
            ? detail.duplicate_stocks
            : [];

        if (duplicates.length > 0) {
          setUploadError(
            `${
              detail.message ||
              "Portfolio upload rejected."
            } Duplicate stocks: ${duplicates.join(
              ", "
            )}.`
          );
        } else {
          setUploadError(
            detail.message ||
              "Portfolio upload rejected."
          );
        }
      }

      /*
       * Handle validation errors.
       */
      else if (
        uploadErr.detail &&
        typeof uploadErr.detail === "object"
      ) {
        const detail =
          uploadErr.detail as {
            errors?: string[];
            message?: string;
          };

        const validationErrors =
          Array.isArray(
            detail.errors
          )
            ? detail.errors
            : [];

        if (
          validationErrors.length > 0
        ) {
          setUploadError(
            validationErrors.join(" ")
          );
        } else {
          setUploadError(
            detail.message ||
              "Portfolio upload rejected."
          );
        }
      }

      /*
       * Handle normal errors.
       */
      else {
        setUploadError(
          err instanceof Error
            ? err.message
            : "Failed to upload portfolio."
        );
      }
    } finally {
      setUploading(false);
    }
  };

  /* =======================================================
     CLEAR FILE
     ======================================================= */

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadError("");
    setUploadSuccess("");
    setUploadDetails([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     CSV TEMPLATE
     ======================================================= */

  const handleDownloadTemplate = () => {
    const csv =
      "stock,quantity,avg_price,current_price,sector\n" +
      "TCS,10,3500,3650,Information Technology\n" +
      "INFY,15,1500,1580,Information Technology\n";

    const blob =
      new Blob(
        [csv],
        {
          type: "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "portfolio_template.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     LOADING STATE
     ======================================================= */

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Portfolio Overview"
          subtitle="Review holdings, allocation, performance, and risk."
        />

        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="text-sm text-slate-500">
              Loading portfolio...
            </p>

          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR STATE
     ======================================================= */

  if (error) {
    return (
      <div>
        <PageHeader
          title="Portfolio Overview"
          subtitle="Review holdings, allocation, performance, and risk."
        />

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

          <h2 className="text-lg font-semibold text-red-800">
            Unable to load portfolio
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

        </div>
      </div>
    );
  }

  /* =======================================================
     NO DATA STATE
     ======================================================= */

  if (!portfolioSummary) {
    return (
      <div>
        <PageHeader
          title="Portfolio Overview"
          subtitle="Review holdings, allocation, performance, and risk."
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <h2 className="text-lg font-semibold text-slate-800">
            No portfolio data available
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            There is currently no portfolio data
            available for this account.
          </p>

        </div>
      </div>
    );
  }

  /* =======================================================
     HOLDINGS
     ======================================================= */

  const holdings: Holding[] =
    portfolioData.map(
      (item) => {
        const pnl =
          (
            item.current_price -
            item.avg_price
          ) * item.quantity;

        return {
          stock: item.stock,

          quantity:
            item.quantity,

          avgPrice:
            `₹${item.avg_price.toLocaleString(
              "en-IN"
            )}`,

          currentPrice:
            `₹${item.current_price.toLocaleString(
              "en-IN"
            )}`,

          pnl:
            `${pnl >= 0 ? "+" : "-"}₹${Math.abs(
              pnl
            ).toLocaleString("en-IN")}`,
        };
      }
    );

  /* =======================================================
     PAGINATION
     ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        holdings.length /
          ITEMS_PER_PAGE
      )
    );

  /*
   * Protect against a stale page number
   * if holdings become smaller.
   */
  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const startIndex =
    (safeCurrentPage - 1) *
    ITEMS_PER_PAGE;

  const paginatedHoldings =
    holdings.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE
    );

  /* =======================================================
     KPI CARDS
     ======================================================= */

  const summaryCards = [
    {
      title: "Total Investment",

      value:
        `₹${portfolioSummary.total_investment.toLocaleString(
          "en-IN"
        )}`,

      color:
        "text-slate-900",
    },

    {
      title: "Current Value",

      value:
        `₹${portfolioSummary.current_value.toLocaleString(
          "en-IN"
        )}`,

      color:
        "text-blue-600",
    },

    {
      title: "Overall Profit",

      value:
        `${
          portfolioSummary.profit >= 0
            ? "+"
            : "-"
        }₹${Math.abs(
          portfolioSummary.profit
        ).toLocaleString("en-IN")}`,

      color:
        portfolioSummary.profit >= 0
          ? "text-green-600"
          : "text-red-600",
    },
  ];

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div>

      <PageHeader
        title="Portfolio Overview"
        subtitle="Review holdings, allocation, performance, and risk."
      />

      {/* ===================================================
          IMPORT PORTFOLIO
          =================================================== */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">

        {/* =================================================
            UPLOAD HEADER
            ================================================= */}

        <div className="bg-gradient-to-r from-blue-50 to-white px-5 py-4">

          <div className="flex items-center justify-between gap-4">

            <button
              type="button"
              onClick={() =>
                setUploadOpen(
                  (open) => !open
                )
              }
              aria-expanded={
                uploadOpen
              }
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0 4 4m-4-4L8 8"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5"
                  />
                </svg>

              </div>

              <div className="min-w-0">

                <h2 className="text-base font-semibold text-slate-900">
                  Import Portfolio
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Add new holdings to your existing
                  portfolio using a CSV file.
                </p>

              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`ml-auto h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
                  uploadOpen
                    ? "rotate-180"
                    : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>

            </button>

            <button
              type="button"
              onClick={
                handleDownloadTemplate
              }
              className="hidden shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 sm:block"
            >
              Download CSV Template
            </button>

          </div>

          {/* Mobile template button */}

          <button
            type="button"
            onClick={
              handleDownloadTemplate
            }
            className="mt-3 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 sm:hidden"
          >
            Download CSV Template
          </button>

        </div>

        {/* =================================================
            EXPANDABLE UPLOAD CONTENT
            ================================================= */}

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            uploadOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >

          <div className="min-h-0 overflow-hidden">

            <div className="border-t border-slate-100 p-5">

              {/* Upload area */}

              <div
                className={`rounded-xl border-2 border-dashed p-6 transition ${
                  selectedFile
                    ? "border-blue-300 bg-blue-50/40"
                    : "border-slate-200 bg-slate-50"
                }`}
              >

                <div className="flex flex-col items-center justify-center text-center">

                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16V4m0 0 4 4m-4-4L8 8"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5"
                      />
                    </svg>

                  </div>

                  {selectedFile ? (
                    <>
                      <p className="font-semibold text-slate-900">
                        {selectedFile.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {(
                          selectedFile.size /
                          1024
                        ).toFixed(1)}{" "}
                        KB
                      </p>

                      <button
                        type="button"
                        onClick={
                          handleClearFile
                        }
                        className="mt-3 text-sm font-medium text-red-600 transition hover:text-red-700"
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-800">
                        Upload your portfolio CSV
                      </p>

                      <p className="mt-1 max-w-md text-sm text-slate-500">
                        Add new holdings to your
                        existing portfolio.
                        Existing stocks are
                        validated for duplicates.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      >
                        Choose CSV File
                      </button>

                      <p className="mt-3 text-xs text-slate-400">
                        CSV only • Maximum 5 MB
                      </p>
                    </>
                  )}

                </div>

              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={
                  handleFileSelect
                }
                className="hidden"
              />

              {/* Upload controls */}

              {selectedFile && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      handleClearFile
                    }
                    disabled={uploading}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleUpload
                    }
                    disabled={uploading}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploading
                      ? "Uploading..."
                      : "Upload Portfolio"}
                  </button>

                </div>
              )}

              {/* Upload error */}

              {uploadError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">

                  <div className="flex gap-3">

                    <div className="mt-0.5 shrink-0 text-red-600">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                        />

                        <path
                          strokeLinecap="round"
                          d="M12 8v4"
                        />

                        <path
                          strokeLinecap="round"
                          d="M12 16h.01"
                        />
                      </svg>

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-red-800">
                        Portfolio upload rejected
                      </p>

                      <p className="mt-1 text-sm leading-5 text-red-700">
                        {uploadError}
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* Upload success */}

              {uploadSuccess && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">

                  <div className="flex gap-3">

                    <div className="mt-0.5 shrink-0 text-green-600">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m5 12 4 4L19 6"
                        />
                      </svg>

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-green-800">
                        {uploadSuccess}
                      </p>

                      {uploadDetails.length > 0 && (
                        <p className="mt-1 text-sm text-green-700">
                          Added{" "}
                          {uploadDetails.length}{" "}
                          {uploadDetails.length === 1
                            ? "holding"
                            : "holdings"}
                          :{" "}
                          {uploadDetails.join(
                            ", "
                          )}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-green-600">
                        Portfolio analytics have
                        been refreshed with the
                        new holdings.
                      </p>

                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ===================================================
          KPI CARDS
          =================================================== */}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

        {summaryCards.map(
          (item) => (
            <KPICard
              key={item.title}
              title={item.title}
              value={item.value}
              valueColor={item.color}
            />
          )
        )}

      </div>

      {/* ===================================================
          PORTFOLIO ALLOCATION
          =================================================== */}

      <div className="mt-8">

        <PortfolioAllocation
          allocations={
            portfolioAllocation
          }
        />

      </div>

      {/* ===================================================
          PORTFOLIO RISK
          =================================================== */}

      <div className="mt-8">

        {portfolioRisk && (
          <PortfolioRisk
            risk={portfolioRisk}
          />
        )}

      </div>

      {/* ===================================================
          PORTFOLIO PERFORMANCE
          =================================================== */}

      <div className="mt-8">

        <PortfolioPerformance
          performance={
            portfolioPerformance
          }
          portfolioReturn={
            portfolioSummary.profit_percentage
          }
        />

      </div>

      {/* ===================================================
          HOLDINGS
          =================================================== */}

      <div className="mt-8 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">

        <div className="p-6 pb-4">

          <h2 className="text-xl font-bold text-slate-900">
            Holdings
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your current portfolio holdings
          </p>

        </div>

        {holdings.length > 0 ? (
          <>

            {/* Only the current page is sent to the table */}

            <PortfolioTable
              holdings={
                paginatedHoldings
              }
            />

            {/* Shared Pagination component */}

            <Pagination
              currentPage={
                safeCurrentPage
              }
              totalPages={
                totalPages
              }
              onPageChange={
                setCurrentPage
              }
            />

          </>
        ) : (
          <div className="mx-6 mb-6 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">

            <p className="text-sm text-slate-500">
              No holdings available.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}