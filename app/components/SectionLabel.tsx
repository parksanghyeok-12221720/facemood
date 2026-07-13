export default function SectionLabel({
  children,
  className = "text-gray-500",
}: {
  children: string;
  className?: string;
}) {
  return (
    <p className={`mb-4 text-xs font-medium tracking-[0.2em] ${className}`}>
      {children}
    </p>
  );
}
