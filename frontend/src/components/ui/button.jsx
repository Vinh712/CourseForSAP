import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c14] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5",
        destructive: "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20",
        outline: "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20",
        secondary: "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white",
        ghost: "text-gray-400 hover:bg-white/5 hover:text-white",
        link: "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300",
        gradient: "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5",
        success: "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        xl: "h-12 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
