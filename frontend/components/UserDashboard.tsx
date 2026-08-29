"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import PageHeader from "@/components/PageHeader";
import KPICard from "@/components/KPICard";

import {
  getPortfolioSummary,
  getPortfolioAllocation,
  getPortfolioPerformance,
  getPortfolioRisk,
  getAIAnalysis,
} from "@/lib/api";


interface PortfolioSummary {
  total_investment: number;
  current_value: number;
  profit: number;
  profit_percentage: number;
  best_performer: string;
  worst_performer: string;
}


interface AllocationItem {
  stock: string;
  current_value: number;
  allocation_percentage: number;
}


interface PerformanceItem {
  stock: string;
  investment: number;
  current_value: number;
  profit: number;
  return_percentage: number;
}


interface PortfolioRisk {
  risk_level: string;
  largest_holding: string;
  largest_allocation: number;
  number_of_holdings: number;
  message: string;
}


interface AIAnalysis {
  portfolio_overview: string;

  key_observations: string[];

  risk_analysis: {
    risk_level: string;
    summary: string;
  };

  performance_highlights: {
    stock: string;
    return_percentage: number;
    profit: number;
    observation: string;
  }[];

  diversification_considerations: string[];

  market_context?: {
    stock: string;
    headline: string;
    observation: string;
  }[];

  disclaimer: string;
}


function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}


/*
 * Format monetary and percentage values appearing
 * inside AI-generated explanatory text.
 *
 * This changes presentation only.
 * The underlying AI response remains unchanged.
 */
function formatAIText(
  text: string,
  summary: PortfolioSummary
) {
  let formatted = text;

  const monetaryValues = [
    summary.total_investment,
    summary.current_value,
    summary.profit,
  ];

  monetaryValues.forEach((value) => {
    const rawInteger = String(value);
    const rawDecimal = `${value.toFixed(1)}`;

    const formattedValue = `₹${value.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    )}`;

    formatted = formatted
      .split(rawDecimal)
      .join(formattedValue);

    formatted = formatted
      .split(rawInteger)
      .join(formattedValue);
  });


  /*
   * Convert:
   *
   * 3.67 percent
   *
   * into:
   *
   * 3.67%
   */
  formatted = formatted.replace(
    /(\d+(?:\.\d+)?)\s+percent\b/gi,
    "$1%"
  );


  /*
   * Remove unnecessary .0 from standalone numbers.
   */
  formatted = formatted.replace(
    /(\d+)\.0\b/g,
    "$1"
  );


  return formatted;
}


export default function UserDashboard() {

  const [summary, setSummary] =
    useState<PortfolioSummary | null>(null);

  const [allocation, setAllocation] =
    useState<AllocationItem[]>([]);

  const [performance, setPerformance] =
    useState<PerformanceItem[]>([]);

  const [risk, setRisk] =
    useState<PortfolioRisk | null>(null);

  const [aiAnalysis, setAIAnalysis] =
    useState<AIAnalysis | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [aiAnalysisLoading, setAIAnalysisLoading] =
    useState(true);

  const [aiAnalysisError, setAIAnalysisError] =
    useState("");


  /*
   * Load portfolio data.
   */
  useEffect(() => {

    async function loadPortfolioData() {

      try {

        setLoading(true);
        setError("");

        const [
          summaryData,
          allocationData,
          performanceData,
          riskData,
        ] = await Promise.all([
          getPortfolioSummary(),
          getPortfolioAllocation(),
          getPortfolioPerformance(),
          getPortfolioRisk(),
        ]);

        setSummary(summaryData);
        setAllocation(allocationData);
        setPerformance(performanceData);
        setRisk(riskData);

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load portfolio data"
        );

      } finally {

        setLoading(false);

      }
    }


    loadPortfolioData();

  }, []);


  /*
   * Load AI analysis independently.
   */
  useEffect(() => {

    async function loadAIAnalysis() {

      try {

        setAIAnalysisLoading(true);
        setAIAnalysisError("");

        const data =
          await getAIAnalysis();

        setAIAnalysis(data);

      } catch (err) {

        setAIAnalysisError(
          err instanceof Error
            ? err.message
            : "Failed to load AI analysis"
        );

      } finally {

        setAIAnalysisLoading(false);

      }
    }


    loadAIAnalysis();

  }, []);


  /*
   * Initial loading state.
   */
  if (loading) {

    return (
      <main>

        <PageHeader
          title="Zerodha AI Financial Intelligence Platform"
          subtitle="AI-powered portfolio intelligence and explainable investment analysis."
        />

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <p className="text-sm text-slate-500">
            Loading portfolio intelligence...
          </p>

        </div>

      </main>
    );
  }


  /*
   * Portfolio API error.
   */
  if (error) {

    return (
      <main>

        <PageHeader
          title="Zerodha AI Financial Intelligence Platform"
          subtitle="AI-powered portfolio intelligence and explainable investment analysis."
        />

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">

          <p className="text-sm text-red-700">
            {error}
          </p>

        </div>

      </main>
    );
  }


  /*
   * No portfolio data.
   */
  if (!summary) {

    return (
      <main>

        <PageHeader
          title="Zerodha AI Financial Intelligence Platform"
          subtitle="AI-powered portfolio intelligence and explainable investment analysis."
        />

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <p className="text-sm text-slate-500">
            No portfolio data available.
          </p>

        </div>

      </main>
    );
  }


  /*
   * Find the largest portfolio allocation.
   */
  const largestAllocation =
    allocation.length > 0
      ? allocation.reduce(
          (largest, current) =>
            current.allocation_percentage >
            largest.allocation_percentage
              ? current
              : largest
        )
      : null;


  /*
   * Use the exact risk message supplied by
   * the backend API.
   */
  const riskMessage =
    risk?.message ??
    (
      largestAllocation
        ? `${largestAllocation.stock} represents ${largestAllocation.allocation_percentage.toFixed(
            2
          )}% of the portfolio. The portfolio has moderate concentration risk.`
        : "Portfolio concentration risk is being monitored."
    );


  /*
   * Colors used by the allocation chart.
   */
  const allocationColors = [
    "#2563eb",
    "#6366f1",
    "#94a3b8",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
  ];


  /*
   * Build the conic-gradient segments without
   * mutating a variable during render.
   *
   * The accumulator keeps track of the cumulative
   * percentage for each segment.
   */
  const allocationStops =
    allocation.reduce<{
      stops: string[];
      cumulative: number;
    }>(
      (result, item, index) => {

        const start =
          result.cumulative;

        const end =
          start +
          item.allocation_percentage;

        const color =
          allocationColors[
            index %
              allocationColors.length
          ];

        result.stops.push(
          `${color} ${start}% ${end}%`
        );

        return {
          stops: result.stops,
          cumulative: end,
        };
      },
      {
        stops: [],
        cumulative: 0,
      }
    ).stops;


  const allocationGradient =
    allocationStops.length > 0
      ? `conic-gradient(${allocationStops.join(
          ", "
        )})`
      : "conic-gradient(#e2e8f0 0% 100%)";


  /*
   * KPI data.
   */
  const kpiData = [
    {
      title: "Portfolio Value",
      value: formatCurrency(
        summary.current_value
      ),
      color: "text-slate-900",
    },

    {
      title: "Total Profit",
      value: formatCurrency(
        summary.profit
      ),
      color:
        summary.profit >= 0
          ? "text-green-600"
          : "text-red-600",
    },

    {
      title: "Portfolio Return",
      value: `${summary.profit_percentage.toFixed(
        2
      )}%`,
      color:
        summary.profit_percentage >= 0
          ? "text-green-600"
          : "text-red-600",
    },

    {
      title: "Risk Level",
      value:
        risk?.risk_level ?? "N/A",
      color:
        risk?.risk_level === "HIGH"
          ? "text-red-600"
          : risk?.risk_level === "MEDIUM"
          ? "text-orange-500"
          : "text-green-600",
    },
  ];


  return (
    <main className="space-y-8">

      {/* Header */}

      <PageHeader
        title="Zerodha AI Financial Intelligence Platform"
        subtitle="AI-powered portfolio intelligence and explainable investment analysis."
      />


      {/* KPI Cards */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

        {kpiData.map((item) => (

          <KPICard
            key={item.title}
            title={item.title}
            value={item.value}
            valueColor={item.color}
          />

        ))}

      </div>


      {/* Allocation and Performance */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Allocation */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Allocation
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Portfolio Allocation
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current portfolio value by holding.
            </p>

          </div>


          <div className="mt-6 flex items-center justify-center">

            <div className="relative h-56 w-56">

              <div
                className="h-full w-full rounded-full"
                style={{
                  background:
                    allocationGradient,
                }}
              />


              <div className="absolute inset-10 flex items-center justify-center rounded-full bg-white">

                <div className="text-center">

                  <p className="text-xs text-slate-400">
                    Holdings
                  </p>

                  <p className="text-2xl font-bold text-slate-900">
                    {allocation.length}
                  </p>

                </div>

              </div>

            </div>

          </div>


          <div className="mt-6 space-y-3">

            {allocation.map(
              (item, index) => (

                <div
                  key={item.stock}
                  className="flex items-center justify-between"
                >

                  <div className="flex items-center gap-2">

                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          allocationColors[
                            index %
                              allocationColors.length
                          ],
                      }}
                    />

                    <span className="text-sm font-medium text-slate-700">
                      {item.stock}
                    </span>

                  </div>


                  <span className="text-sm font-semibold text-slate-900">
                    {item.allocation_percentage.toFixed(
                      2
                    )}
                    %
                  </span>

                </div>

              )
            )}

          </div>

        </section>


        {/* Performance */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Performance
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Holding Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Return percentage by holding.
            </p>

          </div>


          <div className="mt-8 space-y-6">

            {performance.map(
              (item) => {

                const maxReturn = 7;

                const width =
                  Math.min(
                    (
                      Math.abs(
                        item.return_percentage
                      ) /
                      maxReturn
                    ) *
                      100,
                    100
                  );


                return (
                  <div key={item.stock}>

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-sm font-medium text-slate-700">
                        {item.stock}
                      </span>


                      <span
                        className={`text-sm font-bold ${
                          item.return_percentage >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.return_percentage >= 0
                          ? "+"
                          : ""}
                        {item.return_percentage.toFixed(
                          2
                        )}
                        %
                      </span>

                    </div>


                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className={`h-full rounded-full ${
                          item.return_percentage >= 0
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${width}%`,
                        }}
                      />

                    </div>


                    <p
                      className={`mt-1 text-xs ${
                        item.profit >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.profit >= 0
                        ? "+"
                        : ""}
                      {formatCurrency(
                        item.profit
                      )}
                    </p>

                  </div>
                );
              }
            )}

          </div>

        </section>

      </div>


      {/* AI Portfolio Health */}

      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white">
              AI
            </div>


            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                AI Portfolio Health
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Intelligent Portfolio Summary
              </h2>

            </div>

          </div>


          <Link
            href="/insights"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View detailed insights →
          </Link>

        </div>


        {/* AI Loading */}

        {aiAnalysisLoading && (

          <div className="mt-6 rounded-xl bg-white/80 p-6">

            <div className="flex items-center gap-3">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

              <div>

                <p className="text-sm font-medium text-slate-700">
                  Generating AI portfolio analysis...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  The AI workflow is analyzing portfolio,
                  market, and risk context.
                </p>

              </div>

            </div>

          </div>

        )}


        {/* AI Error */}

        {!aiAnalysisLoading &&
          aiAnalysisError && (

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">

              <p className="text-sm font-medium text-amber-700">
                AI analysis is temporarily unavailable.
              </p>

              <p className="mt-1 text-xs text-amber-600">
                The portfolio dashboard is still available.
              </p>

            </div>

          )}


        {/* AI Content */}

        {!aiAnalysisLoading &&
          !aiAnalysisError &&
          aiAnalysis && (

            <>

              <p className="mt-6 max-w-4xl text-sm leading-6 text-slate-600">

                {formatAIText(
                  aiAnalysis.portfolio_overview,
                  summary
                )}

              </p>


              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">

                {aiAnalysis.key_observations.map(
                  (observation, index) => (

                    <div
                      key={index}
                      className="rounded-xl bg-white/80 p-4"
                    >

                      <div className="mb-2 flex items-center gap-2">

                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                          {index + 1}
                        </span>

                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Observation
                        </span>

                      </div>


                      <p className="text-sm leading-5 text-slate-600">

                        {formatAIText(
                          observation,
                          summary
                        )}

                      </p>

                    </div>

                  )
                )}

              </div>


              <div className="mt-5 rounded-xl bg-white/80 p-5">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      AI Risk Assessment
                    </p>

                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {aiAnalysis.risk_analysis.risk_level}
                    </p>

                  </div>


                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                    {aiAnalysis.risk_analysis.risk_level}
                  </span>

                </div>


                <p className="mt-3 text-sm leading-6 text-slate-600">

                  {formatAIText(
                    aiAnalysis.risk_analysis.summary,
                    summary
                  )}

                </p>

              </div>

            </>

          )}

      </section>


      {/* Portfolio Health Details */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Risk */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Risk
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Portfolio Risk
          </h2>


          <p
            className={`mt-5 text-3xl font-bold ${
              risk?.risk_level === "HIGH"
                ? "text-red-600"
                : risk?.risk_level === "MEDIUM"
                ? "text-orange-500"
                : "text-green-600"
            }`}
          >
            {risk?.risk_level ?? "N/A"}
          </p>


          <p className="mt-3 text-sm leading-5 text-slate-500">
            {riskMessage}
          </p>


          <Link
            href="/portfolio"
            className="mt-5 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View portfolio details →
          </Link>

        </section>


        {/* Best Performer */}

        <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
            Best Performer
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {summary.best_performer}
          </h2>


          {performance.find(
            (item) =>
              item.stock ===
              summary.best_performer
          ) && (

            <p className="mt-5 text-3xl font-bold text-green-600">

              +
              {performance
                .find(
                  (item) =>
                    item.stock ===
                    summary.best_performer
                )!
                .return_percentage.toFixed(
                  2
                )}

              %

            </p>

          )}


          <p className="mt-3 text-sm text-slate-500">
            Strongest return among current portfolio
            holdings.
          </p>

        </section>


        {/* Worst Performer */}

        <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
            Worst Performer
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {summary.worst_performer}
          </h2>


          {performance.find(
            (item) =>
              item.stock ===
              summary.worst_performer
          ) && (

            <p className="mt-5 text-3xl font-bold text-red-600">

              {performance
                .find(
                  (item) =>
                    item.stock ===
                    summary.worst_performer
                )!
                .return_percentage.toFixed(
                  2
                )}

              %

            </p>

          )}


          <p className="mt-3 text-sm text-slate-500">
            Holding currently showing the weakest
            return in the portfolio.
          </p>

        </section>

      </div>


      {/* Explore Platform */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-slate-900">
          Explore the Platform
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Drill down into the platform&apos;s intelligence
          and governance capabilities.
        </p>


        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Portfolio */}

          <Link
            href="/portfolio"
            className="rounded-xl bg-slate-50 p-4 transition hover:bg-blue-50"
          >

            <p className="font-semibold text-slate-900">
              Portfolio
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Detailed holdings, allocation, and performance.
            </p>

          </Link>


          {/* AI Insights */}

          <Link
            href="/insights"
            className="rounded-xl bg-slate-50 p-4 transition hover:bg-blue-50"
          >

            <p className="font-semibold text-slate-900">
              AI Insights
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Explainable recommendations and AI analysis.
            </p>

          </Link>


        </div>

      </section>


      {/* Disclaimer */}

      {aiAnalysis?.disclaimer && (

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

          <p className="text-xs leading-5 text-slate-500">
            {aiAnalysis.disclaimer}
          </p>

        </div>

      )}

    </main>
  );
}