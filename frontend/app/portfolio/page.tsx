import KPICard from "@/components/KPICard";
import PageHeader from "@/components/PageHeader";
import PortfolioTable from "@/components/PortfolioTable";

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

const holdings = [
  {
    stock: "TCS",
    quantity: 20,
    avgPrice: "₹3,400",
    currentPrice: "₹3,620",
    pnl: "+₹4,400",
  },
  {
    stock: "Infosys",
    quantity: 15,
    avgPrice: "₹1,520",
    currentPrice: "₹1,610",
    pnl: "+₹1,350",
  },
  {
    stock: "HDFC Bank",
    quantity: 30,
    avgPrice: "₹1,650",
    currentPrice: "₹1,630",
    pnl: "-₹600",
  },
];

export default function PortfolioPage() {
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