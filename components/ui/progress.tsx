"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva("h-2 w-full overflow-hidden rounded-full bg-primary/20", {
  variants: {
    variant: {
      default: "bg-primary/20",
      destructive: "bg-destructive/20",
      warning: "bg-warning/20", // Adicionado variante warning
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & VariantProps<typeof progressVariants>
>(({ className, value, variant, ...props }, ref) => (
  <ProgressPrimitive.Root ref={ref} className={cn(progressVariants({ variant }), className)} {...props}>
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all",
        variant === "destructive" && "bg-destructive",
        variant === "warning" && "bg-warning", // Cor para warning
        variant === "default" && "bg-primary", // Cor para default
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
