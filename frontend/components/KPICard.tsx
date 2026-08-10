type KPICardProps = {
  title: string;
  value: string;
  valueColor?: string;
};

export default function KPICard({
  title,
  value,
  valueColor = "text-slate-900",
}: KPICardProps) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${valueColor}`}
      >
        {value}
      </p>

      <div className="mt-4 h-1 w-12 rounded-full bg-blue-500" />
    </div>
  );
}
