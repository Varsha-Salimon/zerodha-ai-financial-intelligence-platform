type PortfolioRiskData = {
  risk_level: string;
  largest_holding: string | null;
  largest_allocation: number;
  number_of_holdings: number;
  message: string;
};

type PortfolioRiskProps = {
  risk: PortfolioRiskData;
};

export default function PortfolioRisk({
  risk,
}: PortfolioRiskProps) {
  const riskStyles = {
    LOW: {
      badge: "bg-green-100 text-green-700",
      border: "border-green-100",
    },
    MEDIUM: {
      badge: "bg-yellow-100 text-yellow-700",
      border: "border-yellow-100",
    },
    HIGH: {
      badge: "bg-red-100 text-red-700",
      border: "border-red-100",
    },
  };

  const style =
    riskStyles[
      risk.risk_level as keyof typeof riskStyles
    ] ?? riskStyles.MEDIUM;

  return (
    <div
      className={`rounded-2xl border ${style.border} bg-white p-6 shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Portfolio Risk
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Concentration and diversification analysis
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
        >
          {risk.risk_level}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">
            Largest Holding
          </p>

          <p className="mt-2 text-lg font-bold text-slate-900">
            {risk.largest_holding ?? "N/A"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">
            Allocation
          </p>

          <p className="mt-2 text-lg font-bold text-slate-900">
            {risk.largest_allocation.toFixed(2)}%
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">
            Holdings
          </p>

          <p className="mt-2 text-lg font-bold text-slate-900">
            {risk.number_of_holdings}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-blue-50 p-4">
        <p className="text-sm leading-6 text-slate-700">
          {risk.message}
        </p>
      </div>
    </div>
  );
}
