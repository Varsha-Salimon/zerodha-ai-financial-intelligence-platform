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
    <div className="mt-10 rounded-xl bg-white shadow-md p-6">
      <h2 className="mb-4 text-2xl font-bold">
        Holdings
      </h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-3 text-left">Stock</th>
            <th className="py-3 text-left">Quantity</th>
            <th className="py-3 text-left">Average Price</th>
            <th className="py-3 text-left">Current Price</th>
            <th className="py-3 text-left">P&L</th>
          </tr>
        </thead>

        <tbody>
          {holdings.map((holding) => (
            <tr
              key={holding.stock}
              className="border-b hover:bg-gray-50"
            >
              <td className="py-4">{holding.stock}</td>
              <td>{holding.quantity}</td>
              <td>{holding.avgPrice}</td>
              <td>{holding.currentPrice}</td>

              <td
                className={
                  holding.pnl.startsWith("+")
                    ? "font-semibold text-green-600"
                    : "font-semibold text-red-600"
                }
              >
                {holding.pnl}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}