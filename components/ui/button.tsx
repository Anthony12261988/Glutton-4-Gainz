import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tactical-red focus-visible:ring-offset-2 focus-visible:ring-offset-camo-black disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-tactical-red text-high-vis shadow-lg hover:bg-tactical-red/90 active:scale-95",
        destructive:
          "bg-tactical-red text-high-vis shadow-sm hover:bg-tactical-red/80",
        outline:
          "border-2 border-tactical-red bg-transparent text-tactical-red shadow-sm hover:bg-tactical-red/10",
        secondary:
          "bg-steel text-high-vis shadow-sm hover:bg-steel/80",
        ghost: "hover:bg-gunmetal hover:text-tactical-red",
        link: "text-tactical-red underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-sm px-4 text-xs",
        lg: "h-12 rounded-sm px-10 text-base",
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
