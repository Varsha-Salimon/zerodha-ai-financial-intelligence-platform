import InsightCard from "@/components/InsightCard";
import PageHeader from "@/components/PageHeader";

const insights = [
  {
    title: "High Banking Exposure",
    description:
      "Your portfolio has 42% allocation in banking stocks. Consider diversifying into other sectors.",
    type: "warning" as const,
  },
  {
    title: "Buy Opportunity",
    description:
      "TCS shows strong earnings momentum and positive analyst sentiment.",
    type: "success" as const,
  },
  {
    title: "Risk Alert",
    description:
      "Healthcare exposure is currently low. Diversification may reduce portfolio risk.",
    type: "info" as const,
  },
];

export default function InsightsPage() {
  return (
    <div>
      <PageHeader
        title="AI Insights"
        subtitle="AI-generated recommendations for your portfolio."
      />

      <div className="space-y-6">
        {insights.map((insight) => (
          <InsightCard
            key={insight.title}
            title={insight.title}
            description={insight.description}
            type={insight.type}
          />
        ))}
      </div>
    </div>
  );
}