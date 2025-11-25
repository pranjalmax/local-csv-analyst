import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-cyan disabled:pointer-events-none disabled:opacity-50 ring-offset-transparent",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-accent-violet to-accent-cyan text-slate-900 shadow-glow-violet hover:from-accent-cyan hover:to-accent-mint",
        outline:
          "border border-accent-cyan/40 bg-slate-900/30 text-text hover:bg-slate-900/60",
        ghost:
          "bg-transparent text-muted hover:bg-slate-800/60 hover:text-text",
        subtle:
          "bg-slate-900/60 text-text hover:bg-slate-900/80 border border-slate-700/60"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
