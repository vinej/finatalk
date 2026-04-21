import React from "react";

const SIZE_CLASSES = {
  xs: "h-7 px-2 text-xs",
  sm: "h-8 px-2 text-sm",
  md: "h-10 px-3 text-sm",
} as const;

type Size = keyof typeof SIZE_CLASSES;

export function OptionsSelect<T extends string>({
  id,
  value,
  onChange,
  options,
  size = "md",
  className,
  renderLabel,
}: {
  id?: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  size?: Size;
  className?: string;
  renderLabel?: (v: T) => React.ReactNode;
}) {
  const base =
    "rounded-md border border-[var(--color-border)] bg-transparent " +
    SIZE_CLASSES[size];
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={className ? `${base} ${className}` : base}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {renderLabel ? renderLabel(o) : o}
        </option>
      ))}
    </select>
  );
}
