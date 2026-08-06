import KPICard from "@/components/KPICard";
import PageHeader from "@/components/PageHeader";
import PortfolioTable from "@/components/PortfolioTable";
import { getPortfolio } from "@/lib/api";

const portfolioSummary = [
  {
    title: "Total Investment",
    value: "₹10,00,000",
    color: "text-black",
  },
  {
    title: "Current Value",
    value: "₹10,85,000",
    color: "text-blue-600",
  },
  {
    title: "Overall Profit",
    value: "+₹85,000",
    color: "text-green-600",
  },
];

interface PortfolioItem {
  stock: string;
  quantity: number;
  avg_price: number;
  current_price: number;
}

export default async function PortfolioPage() {
  const portfolioData = await getPortfolio();

  const holdings = portfolioData.map((item: PortfolioItem) => ({
    stock: item.stock,
    quantity: item.quantity,
    avgPrice: `₹${item.avg_price}`,
    currentPrice: `₹${item.current_price}`,
    pnl: `₹${(item.current_price - item.avg_price) * item.quantity}`,
  }));

  return (
    <div>
      <PageHeader
        title="Portfolio"
        subtitle="Manage all your investments."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {portfolioSummary.map((item) => (
          <KPICard
            key={item.title}
            title={item.title}
            value={item.value}
            valueColor={item.color}
          />
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-white shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          Holdings
        </h2>

        <PortfolioTable holdings={holdings} />
      </div>
    </div>
  );
}