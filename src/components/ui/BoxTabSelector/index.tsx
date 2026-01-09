"use client";

import styles from "./styles.module.css";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string; // Allow external styling override for container
};

export default function BoxTabSelector({ options, value, onChange, className }: Props) {
  return (
    <div className={`${styles.container} ${className || ""}`}>
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`${styles.button} ${isActive ? styles.active : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
