import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  startIcon?: React.ReactNode;
  wrapperClassName?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, wrapperClassName, startIcon, type = "text", ...props }, ref) => {
    return (
      <div
        data-slot="input-wrapper"
        className={cn(
          "flex h-12 items-center gap-3 rounded-lg border border-brand-border bg-white px-4 text-brand-ink shadow-[0_10px_30px_-24px_rgba(17,17,17,0.35)] transition-colors focus-within:border-brand-orange/50 focus-within:ring-4 focus-within:ring-brand-orange/10",
          props.disabled && "cursor-not-allowed bg-stone-100 text-brand-muted",
          wrapperClassName,
        )}
      >
        {startIcon ? (
          <span className="shrink-0 text-brand-muted [&_svg]:size-4">
            {startIcon}
          </span>
        ) : null}

        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            "w-full border-0 bg-transparent text-base outline-none placeholder:text-brand-muted/80 disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
