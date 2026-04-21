import React from "react";

export function SortTh({
  children,
  onClick,
  active,
  dir,
  align = "left",
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
  align?: "left" | "right";
}) {
  const ariaSort = active ? (dir === "asc" ? "ascending" : "descending") : "none";
  return (
    <th
      aria-sort={ariaSort}
      className={`px-2 py-2 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={onClick}
        className={
          "flex items-center gap-1 text-xs font-medium uppercase " +
          (active
            ? "text-[var(--color-fg)]"
            : "text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]") +
          (align === "right" ? " ml-auto" : "")
        }
      >
        {children}
        {active && <span className="text-[10px]" aria-hidden>{dir === "asc" ? "▲" : "▼"}</span>}
      </button>
    </th>
  );
}
