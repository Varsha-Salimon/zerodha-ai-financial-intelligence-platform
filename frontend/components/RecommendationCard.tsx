"use client";

import { useState } from "react";

import { submitRecommendationFeedback } from "@/lib/api";

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

interface RecommendationCardProps {
  recommendation: Recommendation;
}

function getTypeStyle(type: string) {
  switch (type.toLowerCase()) {
    case "concentration":
      return {
        icon: "◉",
        label: "Concentration",
        iconBg: "bg-blue-50",
        iconText: "text-blue-600",
        labelText: "text-blue-600",
        border: "border-blue-100",
      };

    case "performance":
      return {
        icon: "↗",
        label: "Performance",
        iconBg: "bg-amber-50",
        iconText: "text-amber-600",
        labelText: "text-amber-600",
        border: "border-amber-100",
      };

    case "diversification":
      return {
        icon: "◆",
        label: "Diversification",
        iconBg: "bg-indigo-50",
        iconText: "text-indigo-600",
        labelText: "text-indigo-600",
        border: "border-indigo-100",
      };

    default:
      return {
        icon: "•",
        label: type,
        iconBg: "bg-slate-50",
        iconText: "text-slate-600",
        labelText: "text-slate-600",
        border: "border-slate-200",
      };
  }
}

export default function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const style = getTypeStyle(recommendation.type);
  const [feedback, setFeedback] = useState<
    "HELPFUL" | "NOT_HELPFUL" | null
  >(null);
  const [submittingFeedback, setSubmittingFeedback] =
    useState(false);

  const handleFeedback = async (
    rating: "HELPFUL" | "NOT_HELPFUL"
  ) => {
    if (submittingFeedback || feedback) {
      return;
    }

    try {
      setSubmittingFeedback(true);

      await submitRecommendationFeedback(
        recommendation.generation_id,
        recommendation.type,
        rating
      );

      setFeedback(rating);
    } catch {
      // Keep the card usable if feedback submission fails.
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div
      className={`group min-w-0 rounded-2xl border ${style.border} bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconBg} ${style.iconText} text-lg font-bold`}
        >
          {style.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${style.labelText}`}
              >
                {style.label}
              </p>

              <h3 className="mt-1 break-words text-lg font-semibold leading-6 text-slate-900">
                {recommendation.title}
              </h3>
            </div>

            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-700">
              {recommendation.confidence}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Recommendation
        </p>

        <p className="mt-2 break-words text-sm leading-6 text-slate-600">
          {recommendation.recommendation}
        </p>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

          <p className="text-sm font-semibold text-slate-900">
            Why this was identified
          </p>
        </div>

        <p className="mt-2 break-words text-sm leading-6 text-slate-600">
          {recommendation.rationale}
        </p>
      </div>

      <div className="mt-5 flex min-w-0 items-start justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="shrink-0 text-xs text-slate-400">
          Based on
        </p>

        <p className="min-w-0 break-words text-right text-xs font-medium text-slate-500">
          {recommendation.data_source}
        </p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Was this recommendation useful?
        </p>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => handleFeedback("HELPFUL")}
            disabled={submittingFeedback || feedback !== null}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
              feedback === "HELPFUL"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {feedback === "HELPFUL" ? "✓ Helpful" : "Helpful"}
          </button>

          <button
            type="button"
            onClick={() => handleFeedback("NOT_HELPFUL")}
            disabled={submittingFeedback || feedback !== null}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
              feedback === "NOT_HELPFUL"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {feedback === "NOT_HELPFUL" ? "✓ Not helpful" : "Not helpful"}
          </button>
        </div>

        {feedback && (
          <p className="mt-2 text-xs text-slate-400">
            Thanks for your feedback.
          </p>
        )}
      </div>
    </div>
  );
}
