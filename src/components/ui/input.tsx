import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-11 w-full rounded-lg border px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-background border-input hover:border-examai-purple-400 focus-visible:border-examai-purple-500 focus-visible:ring-2 focus-visible:ring-examai-purple-500/20 focus-visible:shadow-[0_0_0_4px_rgba(168,85,247,0.1)]",
        error: "bg-background border-red-500 hover:border-red-400 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: error ? "error" : variant, className }),
          // Dark mode specific styling
          "dark:bg-examai-navy-900 dark:border-examai-navy-700 dark:placeholder:text-examai-navy-400",
          // Light mode specific styling - better contrast
          "bg-white border-gray-300 placeholder:text-gray-500 text-gray-900",
          "shadow-sm"
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
