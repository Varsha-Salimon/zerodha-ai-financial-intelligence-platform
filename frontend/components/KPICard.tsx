type KPICardProps = {
  title: string;
  value: string;
  valueColor?: string;
};

export default function KPICard({
  title,
  value,
  valueColor = "text-black",
}: KPICardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h2 className="text-lg font-semibold text-gray-600">
        {title}
      </h2>

      <p className={`mt-3 text-3xl font-bold ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}