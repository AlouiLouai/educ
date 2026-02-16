import type { ReactNode } from "react";
import { cn } from "../utils";

type SectionProps = {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
};

export default function Section({ title, description, className, children }: SectionProps) {
  return (
    <section className={cn("py-16", className)}>
      <div className="container flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {description && <p className="text-muted">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
