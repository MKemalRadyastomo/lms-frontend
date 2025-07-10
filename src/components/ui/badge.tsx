import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white hover:bg-green-500/80",
        info: "border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
        purple: "border-transparent bg-purple-500 text-white hover:bg-purple-500/80",
        pink: "border-transparent bg-pink-500 text-white hover:bg-pink-500/80",
        indigo: "border-transparent bg-indigo-500 text-white hover:bg-indigo-500/80",
        // Soft variants for better accessibility
        "success-soft": "border-transparent bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
        "info-soft": "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
        "warning-soft": "border-transparent bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200",
        "destructive-soft": "border-transparent bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
