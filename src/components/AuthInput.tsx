// components/AuthInput.tsx
interface Props {
    type?: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}

export default function AuthInput({ type = "text", placeholder, value, onChange }: Props) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border rounded p-2 w-64 mb-2"
        />
    );
}
