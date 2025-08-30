import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-gold-600 text-primary-foreground shadow-sm hover:shadow-md hover:from-gold-600 hover:to-gold-700",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:shadow-md hover:from-red-600 hover:to-red-700",
        outline:
          "border-2 border-primary/20 bg-transparent text-primary hover:bg-primary/5 hover:border-primary/40",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-green-300 hover:border-green-400",
        ghost: "hover:bg-muted hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
        accent: "bg-gradient-to-r from-accent to-terracotta-600 text-accent-foreground shadow-sm hover:shadow-md hover:from-terracotta-600 hover:to-terracotta-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
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
