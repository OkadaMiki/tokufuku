// components/AuthInput.tsx
interface Props {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  className?: string; // Add className prop
}

export default function AuthInput({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "", // Default to empty string
}: Props) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border rounded p-2 w-64 mb-2 ${className}`} // Append className
    />
  );
}
