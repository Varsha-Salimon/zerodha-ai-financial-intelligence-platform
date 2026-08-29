"use client";

import { useEffect, useState } from "react";

import KPICard from "@/components/KPICard";
import PageHeader from "@/components/PageHeader";
import PortfolioTable from "@/components/PortfolioTable";
import PortfolioAllocation from "@/components/PortfolioAllocation";
import PortfolioRisk from "@/components/PortfolioRisk";
import PortfolioPerformance from "@/components/PortfolioPerformance";

import {
  getPortfolio,
  getPortfolioSummary,
  getPortfolioAllocation,
  getPortfolioRisk,
  getPortfolioPerformance,
} from "@/lib/api";


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

function extractArray<T>(
  data: unknown
): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    data &&
    typeof data === "object" &&
    "value" in data
  ) {
    const value = (
      data as { value?: unknown }
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
     NO DATA
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

          quantity: item.quantity,

          avgPrice: `₹${item.avg_price.toLocaleString(
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
     KPI CARDS
     ======================================================= */

  const summaryCards = [
    {
      title: "Total Investment",

      value:
        `₹${portfolioSummary.total_investment.toLocaleString(
          "en-IN"
        )}`,

      color: "text-slate-900",
    },

    {
      title: "Current Value",

      value:
        `₹${portfolioSummary.current_value.toLocaleString(
          "en-IN"
        )}`,

      color: "text-blue-600",
    },

    {
      title: "Overall Profit",

      value:
        `${portfolioSummary.profit >= 0 ? "+" : "-"}₹${Math.abs(
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
          KPI CARDS
          =================================================== */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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

      <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Holdings
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your current portfolio holdings
          </p>
        </div>

        {holdings.length > 0 ? (
          <PortfolioTable
            holdings={holdings}
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">
              No holdings available.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}