import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        primary: "bg-[rgba(31,95,169,0.18)] text-[#1a4a85]",
        success: "bg-[rgba(47,159,140,0.2)] text-[#1b6a5b]",
        warning: "bg-[rgba(242,185,73,0.22)] text-[#8a5b0e]",
        muted: "bg-black/5 text-muted",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
