type Allocation = {
  stock: string;
  current_value: number;
  allocation_percentage: number;
};

type PortfolioAllocationProps = {
  allocations: Allocation[];
};

export default function PortfolioAllocation({
  allocations,
}: PortfolioAllocationProps) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Portfolio Allocation
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current allocation across your holdings
        </p>
      </div>

      <div className="space-y-5">
        {allocations.map((item) => (
          <div key={item.stock}>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-slate-800">
                {item.stock}
              </span>

              <span className="font-semibold text-slate-700">
                {item.allocation_percentage.toFixed(2)}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-blue-50">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${item.allocation_percentage}%`,
                }}
              />
            </div>

            <p className="mt-1 text-xs text-slate-500">
              ₹{item.current_value.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
