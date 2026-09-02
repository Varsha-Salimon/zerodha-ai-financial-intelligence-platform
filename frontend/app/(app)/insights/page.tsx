"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/PageHeader";
import RecommendationCard from "@/components/RecommendationCard";

import {
  getPortfolio,
  getRecommendations,
  generateRecommendations,
  getAIAnalysis,
} from "@/lib/api";

interface Recommendation {
  generation_id: string;
  type: string;
  title: string;
  recommendation: string;
  rationale: string;
  supporting_metrics: Record<string, unknown>;
  confidence: string;
  data_source: string;
  disclaimer: string;
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

export default function InsightsPage() {
  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  const [aiAnalysis, setAIAnalysis] =
    useState<AIAnalysis | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [loadingAI, setLoadingAI] =
    useState(false);

  const [error, setError] =
    useState("");

  const [aiError, setAIError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      try {
        setLoading(true);
        setError("");

        const [portfolio, savedRecommendations] =
          await Promise.all([
            getPortfolio(),
            getRecommendations(),
          ]);

        if (cancelled) {
          return;
        }

        const currentHoldingCount =
          Array.isArray(portfolio)
            ? portfolio.length
            : 0;

        const savedHoldingCount =
          savedRecommendations.length > 0
            ? Number(
                savedRecommendations[0]
                  ?.supporting_metrics
                  ?.number_of_holdings ?? -1
              )
            : -1;

        const recommendationsAreStale =
          savedRecommendations.length > 0 &&
          savedHoldingCount !== currentHoldingCount;

        if (recommendationsAreStale) {
          const freshRecommendations =
            await generateRecommendations();

          if (!cancelled) {
            setRecommendations(
              freshRecommendations
            );
          }

          return;
        }

        if (!cancelled) {
          setRecommendations(
            savedRecommendations
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load recommendations"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRegenerate =
    async () => {
      try {
        setGenerating(true);
        setError("");

        const data =
          await generateRecommendations();

        setRecommendations(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to regenerate recommendations"
        );
      } finally {
        setGenerating(false);
      }
    };

  const handleGenerateAIAnalysis =
    async () => {
      try {
        setLoadingAI(true);
        setAIError("");

        const data =
          await getAIAnalysis();

        setAIAnalysis(data);
      } catch (err) {
        setAIError(
          err instanceof Error
            ? err.message
            : "Failed to generate AI analysis"
        );
      } finally {
        setLoadingAI(false);
      }
    };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Portfolio Intelligence"
        subtitle="AI-generated portfolio analysis combined with explainable recommendations."
      />

      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 shadow-sm">
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
              AI
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                AI Portfolio Analysis
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Generate an AI-powered analysis using
                portfolio analytics and controlled
                financial context. The generated response
                is validated before being presented.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAIAnalysis}
            disabled={loadingAI}
            className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAI
              ? "Generating Analysis..."
              : "Generate AI Analysis"}
          </button>
        </div>
      </section>

      {aiError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {aiError}
        </div>
      )}

      {aiAnalysis && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                AI Analysis
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Portfolio Overview
              </h2>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {aiAnalysis.portfolio_overview}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Key Observations
            </h2>
            <div className="mt-4 space-y-3">
              {aiAnalysis.key_observations.map(
                (observation, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-slate-50 p-4"
                  >
                    <p className="text-sm leading-6 text-slate-600">
                      {observation}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Risk Analysis
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Portfolio concentration and risk assessment.
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-4 py-2 text-xs font-semibold ${
                  aiAnalysis.risk_analysis.risk_level ===
                  "HIGH"
                    ? "bg-red-50 text-red-700"
                    : aiAnalysis.risk_analysis.risk_level ===
                        "MEDIUM"
                      ? "bg-orange-50 text-orange-700"
                      : "bg-green-50 text-green-700"
                }`}
              >
                {aiAnalysis.risk_analysis.risk_level}
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-600">
                {aiAnalysis.risk_analysis.summary}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Performance Highlights
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {aiAnalysis.performance_highlights.map(
                (item) => (
                  <div
                    key={item.stock}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">
                        {item.stock}
                      </h3>

                      <span
                        className={`text-sm font-semibold ${
                          item.return_percentage >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.return_percentage >= 0
                          ? "+"
                          : ""}
                        {item.return_percentage.toFixed(2)}%
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {item.observation}
                    </p>

                    <p className="mt-3 text-xs text-slate-400">
                      Profit/Loss: ₹
                      {item.profit.toFixed(2)}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Diversification Considerations
            </h2>

            <div className="mt-4 space-y-3">
              {aiAnalysis.diversification_considerations.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-slate-50 p-4"
                  >
                    <p className="text-sm leading-6 text-slate-600">
                      {item}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {aiAnalysis.market_context &&
            aiAnalysis.market_context.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                  Market Context
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {aiAnalysis.market_context.map(
                    (item) => (
                      <div
                        key={`${item.stock}-${item.headline}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          {item.stock}
                        </p>

                        <h3 className="mt-1 font-semibold text-slate-900">
                          {item.headline}
                        </h3>

                        <p className="mt-2 text-sm leading-5 text-slate-600">
                          {item.observation}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <p className="text-xs leading-5 text-amber-800">
              {aiAnalysis.disclaimer}
            </p>
          </div>
        </section>
      )}

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Explainable Recommendations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Deterministic recommendations generated from
              portfolio risk and performance analytics.
            </p>
          </div>

          {!loading && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {recommendations.length}{" "}
              {recommendations.length === 1
                ? "Recommendation"
                : "Recommendations"}
            </span>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Loading recommendations...
          </div>
        )}

        {!loading &&
          recommendations.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h3 className="font-semibold text-slate-900">
                No recommendations available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Run the recommendation engine against
                the current portfolio analytics.
              </p>

              <button
                type="button"
                onClick={handleRegenerate}
                disabled={generating}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {generating
                  ? "Regenerating..."
                  : "Generate Recommendations"}
              </button>
            </div>
          )}

        {!loading &&
          recommendations.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.map(
                (recommendation, index) => (
                  <RecommendationCard
                    key={`${recommendation.type}-${recommendation.generation_id}-${index}`}
                    recommendation={recommendation}
                  />
                )
              )}
            </div>
          )}

        {!loading &&
          recommendations.length > 0 && (
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={generating}
                className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating
                  ? "Regenerating..."
                  : "Regenerate Recommendations"}
              </button>
            </div>
          )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            How portfolio intelligence works
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            AI analysis and deterministic recommendations
            work together to provide explainable portfolio
            intelligence.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              1
            </div>

            <h3 className="font-semibold text-slate-900">
              Analyze
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Portfolio holdings are retrieved from
              PostgreSQL and evaluated by deterministic
              analytics.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              2
            </div>

            <h3 className="font-semibold text-slate-900">
              Enrich
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              The Portfolio Agent retrieves approved
              portfolio, analytics, market, and news context
              through MCP.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              3
            </div>

            <h3 className="font-semibold text-slate-900">
              Explain
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Gemini interprets the grounded context and the
              result is validated before it is presented.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
