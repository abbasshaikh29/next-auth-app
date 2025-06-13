import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          borderColor: "var(--input-border)",
          backgroundColor: "var(--input-bg)",
          color: "var(--text-primary)"
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--input-focus)";
          e.target.style.boxShadow = "var(--focus-ring)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--input-border)";
          e.target.style.boxShadow = "none";
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
