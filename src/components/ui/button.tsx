import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-examai-purple-500 to-examai-purple-600 text-white hover:brightness-110 hover:shadow-examai-purple-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-examai-purple",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border-2 border-examai-purple-500 bg-transparent text-examai-purple-500 hover:bg-examai-purple-500 hover:text-white hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "border-2 border-examai-purple-500 bg-transparent text-examai-purple-500 hover:bg-examai-purple-500/10 hover:-translate-y-0.5 active:translate-y-0",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "bg-gradient-to-r from-examai-amber-500 to-examai-amber-600 text-black font-semibold hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        hero: "bg-gradient-to-br from-examai-purple-500 to-examai-purple-600 text-white hover:brightness-110 hover:shadow-examai-purple-lg hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-100 font-semibold animate-purple-glow",
        sun: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm hover:shadow-glow hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 active:scale-100",
        solid: "bg-examai-purple-500 text-white font-semibold hover:bg-examai-purple-600 hover:-translate-y-0.5 hover:shadow-examai-purple active:translate-y-0 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
