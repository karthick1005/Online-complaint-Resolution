import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "text-foreground border border-border",
    critical: "border border-transparent bg-red-500 text-white",
    high: "border border-transparent bg-orange-500 text-white",
    medium: "border border-transparent bg-yellow-500 text-white",
    low: "border border-transparent bg-green-500 text-white",
    registered: "border border-transparent bg-blue-500 text-white",
    assigned: "border border-transparent bg-purple-500 text-white",
    inprogress: "border border-transparent bg-cyan-500 text-white",
    resolved: "border border-transparent bg-emerald-500 text-white",
    escalated: "border border-transparent bg-red-600 text-white",
    closed: "border border-transparent bg-gray-500 text-white",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-smooth",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
