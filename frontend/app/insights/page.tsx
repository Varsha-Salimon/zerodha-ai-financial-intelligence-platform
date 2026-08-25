import PageHeader from "@/components/PageHeader";
import RecommendationCard from "@/components/RecommendationCard";
import { getRecommendations } from "@/lib/api";

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

export default async function InsightsPage() {
  const recommendations: Recommendation[] =
    await getRecommendations();

  // The portfolio-level recommendation duplicates
  // information already shown on the Portfolio page.
  const actionableRecommendations =
    recommendations.filter(
      (recommendation) =>
        recommendation.type !== "portfolio"
    );

  return (
    <div className="space-y-8">

      {/* ================================================== */}
      {/* Page Header */}
      {/* ================================================== */}

      <PageHeader
        title="AI Insights"
        subtitle="Explainable recommendations generated from your portfolio analytics."
      />

      {/* ================================================== */}
      {/* AI Summary Banner */}
      {/* ================================================== */}

      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 shadow-sm">
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl shadow-sm">
              🤖
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Portfolio Intelligence
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                AI-generated recommendations based on the
                portfolio data and analytics available to the
                application. Each recommendation includes the
                reasoning and supporting data behind it.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center">
            <div className="rounded-xl border border-blue-100 bg-white px-6 py-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-600">
                {actionableRecommendations.length}
              </p>

              <p className="text-xs font-medium text-slate-500">
                Recommendations
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* Recommendations */}
      {/* ================================================== */}

      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Recommendations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review the areas identified by the AI analysis.
            </p>
          </div>

          <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:block">
            Based on portfolio analytics
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={`${recommendation.type}-${index}`}
              recommendation={recommendation}
            />
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* How recommendations are generated */}
      {/* ================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            How these recommendations work
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            The recommendation engine uses portfolio analytics
            rather than external market assumptions.
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
              Portfolio holdings and calculated analytics are
              evaluated for notable patterns.
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
              Each recommendation includes the reason it was
              identified and the supporting metrics.
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
              Recommendations are provided for consideration
              and do not automatically execute trades.
            </p>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* Disclaimer */}
      {/* ================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs leading-5 text-slate-500">
          Recommendations are generated from the portfolio
          data and analytics available to the application.
          They are provided for informational purposes only
          and do not constitute financial, investment, or
          trading advice.
        </p>
      </div>

    </div>
  );
}