import { cn } from "@/lib/utils"

const getSkeletonClassName = (className: string) => cn("animate-pulse rounded-md bg-muted", className)

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={getSkeletonClassName(className)}
      {...props}
    />
  )
}

export { Skeleton }