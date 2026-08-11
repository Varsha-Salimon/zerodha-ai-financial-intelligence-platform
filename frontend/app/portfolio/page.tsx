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

interface PortfolioItem {
  stock: string;
  quantity: number;
  avg_price: number;
  current_price: number;
}

export default async function PortfolioPage() {
  const portfolioData = await getPortfolio();
  const portfolioSummary = await getPortfolioSummary();
  const portfolioAllocation = await getPortfolioAllocation();
  const portfolioRisk = await getPortfolioRisk();
  const portfolioPerformance = await getPortfolioPerformance();

  const holdings = portfolioData.map(
    (item: PortfolioItem) => {
      const pnl =
        (item.current_price - item.avg_price) *
        item.quantity;

      return {
        stock: item.stock,
        quantity: item.quantity,
        avgPrice: `₹${item.avg_price.toLocaleString(
          "en-IN"
        )}`,
        currentPrice: `₹${item.current_price.toLocaleString(
          "en-IN"
        )}`,
        pnl: `${pnl >= 0 ? "+" : "-"}₹${Math.abs(
          pnl
        ).toLocaleString("en-IN")}`,
      };
    }
  );



  const summaryCards = [
    {
      title: "Total Investment",
      value: `₹${portfolioSummary.total_investment.toLocaleString(
        "en-IN"
      )}`,
      color: "text-slate-900",
    },
    {
      title: "Current Value",
      value: `₹${portfolioSummary.current_value.toLocaleString(
        "en-IN"
      )}`,
      color: "text-blue-600",
    },
    {
      title: "Overall Profit",
      value: `₹${portfolioSummary.profit.toLocaleString(
        "en-IN"
      )}`,
      color:
        portfolioSummary.profit >= 0
          ? "text-green-600"
          : "text-red-600",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Portfolio"
        subtitle="Manage all your investments."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {summaryCards.map((item) => (
          <KPICard
            key={item.title}
            title={item.title}
            value={item.value}
            valueColor={item.color}
          />
        ))}
      </div>

      {/* Portfolio Allocation */}
      <div className="mt-8">
        <PortfolioAllocation
          allocations={portfolioAllocation}
        />
      </div>
      {/* Portfolio Risk */}
      <div className="mt-8">
        <PortfolioRisk risk={portfolioRisk} />
      </div>
      {/* Portfolio Performance */}
      <div className="mt-8">
        <PortfolioPerformance
          performance={portfolioPerformance}
          portfolioReturn={
            portfolioSummary.profit_percentage
          }
        />
      </div>
      {/* Holdings */}
      <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Holdings
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your current portfolio holdings
          </p>
        </div>

        <PortfolioTable holdings={holdings} />
      </div>
    </div>
  );
}
