"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      payload-slot="tabs"
      payload-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 payload-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-payload-horizontal/tabs:h-9 group-payload-vertical/tabs:h-fit group-payload-vertical/tabs:flex-col payload-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      payload-slot="tabs-list"
      payload-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      payload-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-payload-vertical/tabs:w-full group-payload-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-payload-[icon=inline-end]:pr-1.5 has-payload-[icon=inline-start]:pl-1.5 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-payload-[variant=default]/tabs-list:payload-active:shadow-sm group-payload-[variant=line]/tabs-list:payload-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-payload-[variant=line]/tabs-list:bg-transparent group-payload-[variant=line]/tabs-list:payload-active:bg-transparent dark:group-payload-[variant=line]/tabs-list:payload-active:border-transparent dark:group-payload-[variant=line]/tabs-list:payload-active:bg-transparent",
        "payload-active:bg-background payload-active:text-foreground dark:payload-active:border-input dark:payload-active:bg-input/30 dark:payload-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-payload-horizontal/tabs:after:inset-x-0 group-payload-horizontal/tabs:after:bottom-[-5px] group-payload-horizontal/tabs:after:h-0.5 group-payload-vertical/tabs:after:inset-y-0 group-payload-vertical/tabs:after:-right-1 group-payload-vertical/tabs:after:w-0.5 group-payload-[variant=line]/tabs-list:payload-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      payload-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
