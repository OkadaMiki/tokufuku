// components/PrimaryButton.tsx
interface Props {
  text: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: "blue" | "green" | "red";
  className?: string;
}

export default function PrimaryButton({
  text,
  onClick,
  loading = false,
  disabled = false,
  color = "blue",
  className = "",
}: Props) {
  const base =
    color === "blue"
      ? "bg-blue-500 hover:bg-blue-600"
      : color === "green"
        ? "bg-green-500 hover:bg-green-600"
        : "bg-red-500 hover:bg-red-600";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} text-white px-4 py-2 rounded transition ${className}`}
    >
      {loading ? `${text}中…` : text}
    </button>
  );
}
