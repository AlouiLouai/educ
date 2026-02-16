import type { ReactNode } from "react";
import { cn } from "../utils";

type ShellProps = {
  children: ReactNode;
  className?: string;
};

export default function Shell({ children, className }: ShellProps) {
  return <div className={cn("min-h-screen", className)}>{children}</div>;
}
