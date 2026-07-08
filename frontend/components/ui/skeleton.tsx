import { cn } from "@/lib/utils"

/**
 * Skeleton
 * @param {*} { className
 * @param {*} ...props }: React.ComponentProps<"div">
 * @returns {*}
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
