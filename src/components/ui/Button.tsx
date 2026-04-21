import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-orange/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        black:
          "bg-brand-ink text-white shadow-[0_8px_20px_-12px_rgba(17,17,17,0.7)] hover:bg-brand-ink/92",
        orange:
          "bg-brand-orange text-white hover:bg-[#e46812]",
        white:
          "border border-brand-border bg-white text-brand-ink shadow-[0_10px_30px_-24px_rgba(17,17,17,0.35)] hover:bg-brand-soft",
      },
      size: {
        sm: "h-11 px-4 text-sm",
        default: "h-12 px-5 text-base",
        lg: "h-14 px-6 text-base",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "black",
      size: "default",
      fullWidth: false,
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...(!asChild ? { type: props.type ?? "button" } : {})}
      {...props}
    />
  );
}

export { Button, buttonVariants };
