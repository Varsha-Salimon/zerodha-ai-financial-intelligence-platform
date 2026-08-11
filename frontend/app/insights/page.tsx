import InsightCard from "@/components/InsightCard";
import PageHeader from "@/components/PageHeader";
import { getInsights } from "@/lib/api";

interface Insight {
  type: string;
  title: string;
  message: string;
  severity: string;
  stock: string | null;
}

export default async function InsightsPage() {
  const insights: Insight[] = await getInsights();

  return (
    <div>
      <PageHeader
        title="AI Insights"
        subtitle="AI-generated insights based on your portfolio."
      />

      <div className="space-y-6">
        {insights.map((insight, index) => {
          let cardType:
            | "warning"
            | "success"
            | "info";

          if (insight.severity === "warning") {
            cardType = "warning";
          } else if (
            insight.severity === "positive"
          ) {
            cardType = "success";
          } else {
            cardType = "info";
          }

          return (
            <InsightCard
              key={`${insight.type}-${insight.stock}-${index}`}
              title={insight.title}
              description={insight.message}
              type={cardType}
            />
          );
        })}
      </div>
    </div>
  );
}
