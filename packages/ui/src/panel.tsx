import type { PropsWithChildren } from "react";

type PanelProps = PropsWithChildren<{
  className?: string;
}>;

export function Panel({ children, className }: PanelProps) {
  return <div className={["panel", className].filter(Boolean).join(" ")}>{children}</div>;
}

