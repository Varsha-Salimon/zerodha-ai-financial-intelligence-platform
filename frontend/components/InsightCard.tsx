type InsightCardProps = {
  title: string;
  description: string;
  type: "success" | "warning" | "info";
};

export default function InsightCard({
  title,
  description,
  type,
}: InsightCardProps) {
  const styles = {
    success: "border-green-500 bg-green-50",
    warning: "border-yellow-500 bg-yellow-50",
    info: "border-blue-500 bg-blue-50",
  };

  return (
    <div className={`rounded-xl border-l-4 p-6 shadow ${styles[type]}`}>
      <h3 className="text-xl font-semibold">{title}</h3>

      <p className="mt-2 text-gray-700">
        {description}
      </p>
    </div>
  );
}