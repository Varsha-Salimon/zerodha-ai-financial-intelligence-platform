type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export default function PageHeader({
  title,
  subtitle,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold">{title}</h1>

      <p className="mt-2 text-gray-600">
        {subtitle}
      </p>
    </div>
  );
}