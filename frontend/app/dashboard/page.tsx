import PageHeader from "@/components/PageHeader";
import KPICard from "@/components/KPICard";

const kpiData = [
  {
    title: "Portfolio Value",
    value: "₹0.00",
    color: "text-black",
  },
  {
    title: "Today's Profit",
    value: "₹0.00",
    color: "text-green-600",
  },
  {
    title: "Risk Score",
    value: "Medium",
    color: "text-orange-500",
  },
];

export default function DashboardPage() {
  return (
    <main>
      <PageHeader
        title="Zerodha AI Financial Intelligence Platform"
        subtitle="Welcome to your AI-powered investment dashboard."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {kpiData.map((item) => (
          <KPICard
            key={item.title}
            title={item.title}
            value={item.value}
            valueColor={item.color}
          />
        ))}
      </div>
    </main>
  );
}