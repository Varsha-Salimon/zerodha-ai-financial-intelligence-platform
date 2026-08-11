type PerformanceItem = {
  stock: string;
  investment: number;
  current_value: number;
  profit: number;
  return_percentage: number;
};

type PortfolioPerformanceProps = {
  performance: PerformanceItem[];
  portfolioReturn: number;
};

export default function PortfolioPerformance({
  performance,
  portfolioReturn,
}: PortfolioPerformanceProps) {
  if (!performance.length) {
    return null;
  }

  const bestPerformer = performance.reduce(
    (best, item) =>
      item.return_percentage >
      best.return_percentage
        ? item
        : best
  );

  const worstPerformer = performance.reduce(
    (worst, item) =>
      item.return_percentage <
      worst.return_percentage
        ? item
        : worst
  );

  const isWorstPositive =
    worstPerformer.return_percentage >= 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Performance Snapshot
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          A quick view of portfolio performance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Best Performer */}
        <div className="rounded-xl bg-green-50 p-5">
          <p className="text-sm font-medium text-slate-600">
            Best Performer
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {bestPerformer.stock}
          </p>

          <p className="mt-1 text-lg font-semibold text-green-600">
            +{bestPerformer.return_percentage.toFixed(2)}%
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Profit: +₹
            {bestPerformer.profit.toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        {/* Portfolio Return */}
        <div className="rounded-xl bg-blue-50 p-5">
          <p className="text-sm font-medium text-slate-600">
            Portfolio Return
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {portfolioReturn >= 0 ? "+" : ""}
            {portfolioReturn.toFixed(2)}%
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Overall portfolio performance
          </p>
        </div>

        {/* Needs Attention */}
        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-600">
            Needs Attention
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {worstPerformer.stock}
          </p>

          <p
            className={`mt-1 text-lg font-semibold ${
              isWorstPositive
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {isWorstPositive ? "+" : ""}
            {worstPerformer.return_percentage.toFixed(
              2
            )}
            %
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {isWorstPositive
              ? "Lowest performing holding"
              : "Currently generating a loss"}
          </p>
        </div>
      </div>
    </div>
  );
}
