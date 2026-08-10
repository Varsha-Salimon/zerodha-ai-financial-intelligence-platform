type Holding = {
  stock: string;
  quantity: number;
  avgPrice: string;
  currentPrice: string;
  pnl: string;
};

type PortfolioTableProps = {
  holdings: Holding[];
};

export default function PortfolioTable({
  holdings,
}: PortfolioTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50">
            <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
              Stock
            </th>

            <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
              Quantity
            </th>

            <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
              Average Price
            </th>

            <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
              Current Price
            </th>

            <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
              P&L
            </th>
          </tr>
        </thead>

        <tbody className="bg-white">
          {holdings.map((holding, index) => {
            const pnlValue = Number(
              holding.pnl.replace("₹", "")
            );

            const isProfit = pnlValue >= 0;

            return (
              <tr
                key={holding.stock}
                className={`transition hover:bg-blue-50/50 ${
                  index !== holdings.length - 1
                    ? "border-b border-slate-100"
                    : ""
                }`}
              >
                <td className="px-5 py-4 font-semibold text-slate-900">
                  {holding.stock}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {holding.quantity}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {holding.avgPrice}
                </td>

                <td className="px-5 py-4 font-medium text-slate-800">
                  {holding.currentPrice}
                </td>

                <td
                  className={`py-4 font-semibold ${
                    holding.pnl.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {holding.pnl}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}