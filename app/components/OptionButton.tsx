export default function OptionButton({
  label,
  selected = false,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-5 py-4 text-left text-sm transition-colors ${
        selected
          ? "border-white bg-white text-black"
          : "border-white/10 bg-white/[0.03] text-gray-200 hover:border-white/30 hover:bg-white/[0.06]"
      }`}
    >
      {label}
    </button>
  );
}
