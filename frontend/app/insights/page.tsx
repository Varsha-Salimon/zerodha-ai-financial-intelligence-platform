"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/PageHeader";
import RecommendationCard from "@/components/RecommendationCard";

import {
  getRecommendations,
  generateRecommendations,
} from "@/lib/api";

interface Recommendation {
  type: string;
  title: string;
  recommendation: string;
  rationale: string;
  supporting_metrics: Record<string, unknown>;
  confidence: string;
  data_source: string;
  disclaimer: string;
}

export default function InsightsPage() {
  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadRecommendations =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getRecommendations();

        setRecommendations(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load recommendations"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleGenerate =
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
            : "Failed to generate recommendations"
        );
      } finally {
        setGenerating(false);
      }
    };

  return (
    <div className="space-y-8">

      {/* Header */}

      <PageHeader
        title="AI Insights"
        subtitle="Explainable recommendations generated from your portfolio analytics."
      />

      {/* AI Summary */}

      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 shadow-sm">

        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
              AI
            </div>

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Portfolio Intelligence
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                AI-generated recommendations based
                on the portfolio data and analytics
                available to the application. Each
                recommendation includes the reasoning
                and supporting data behind it.
              </p>

            </div>

          </div>

          {/* Generate button */}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating
              ? "Generating..."
              : "Generate Recommendations"}
          </button>

        </div>

      </section>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Recommendations */}

      <section>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h2 className="text-xl font-semibold text-slate-900">
              Recommendations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review the areas identified by the
              recommendation engine.
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
                Generate recommendations from the
                current portfolio analytics.
              </p>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {generating
                  ? "Generating..."
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
                    key={`${recommendation.type}-${index}`}
                    recommendation={recommendation}
                  />
                )
              )}

            </div>
          )}

      </section>

      {/* How recommendations work */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5">

          <h2 className="text-lg font-semibold text-slate-900">
            How these recommendations work
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recommendations are generated from
            deterministic portfolio analytics rather
            than automatic trading decisions.
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
              Portfolio holdings and calculated
              analytics are evaluated for notable
              patterns.
            </p>

          </div>

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              2
            </div>

            <h3 className="font-semibold text-slate-900">
              Explain
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Each recommendation includes the
              reason it was identified and supporting
              metrics.
            </p>

          </div>

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              3
            </div>

            <h3 className="font-semibold text-slate-900">
              Review
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Recommendations are provided for
              consideration and do not automatically
              execute trades.
            </p>

          </div>

        </div>

      </section>

      {/* Disclaimer */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <p className="text-xs leading-5 text-slate-500">
          Recommendations are generated from the
          portfolio data and analytics available to
          the application. They are provided for
          informational purposes only and do not
          constitute financial, investment, or trading
          advice.
        </p>

      </div>

    </div>
  );
}