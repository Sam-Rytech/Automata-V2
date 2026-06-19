use client
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "@/lib/utils"

function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function getTooltipContentClassName(className: string, side: string) {
  return cn(
    "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background",
    "has-data-[slot=kbd]:pr-1.5",
    `data-[side=${side}]:slide-in-from-${getSlideInDirection(side)}-2`,
    className
  )
}

function getSlideInDirection(side: string) {
  switch (side) {
    case "bottom":
      return "top"
    case "inline-end":
      return "left"
    case "inline-start":
      return "right"
    case "left":
      return "right"
    case "right":
      return "left"
    case "top":
      return "bottom"
    default:
      return ""
  }
}

function getArrowClassName(side: string) {
  return cn(
    "z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground",
    `data-[side=${side}]:top-${getArrowTop(side)}!`,
    `data-[side=${side}]:-left-${getArrowLeft(side)}!`,
    `data-[side=${side}]:-translate-y-${getArrowTranslateY(side)}!`,
    `data-[side=${side}]:-right-${getArrowRight(side)}!`,
    `data-[side=${side}]:-bottom-${getArrowBottom(side)}!`
  )
}

function getArrowTop(side: string) {
  switch (side) {
    case "bottom":
      return 1
    case "inline-end":
      return 1 / 2
    case "inline-start":
      return 1 / 2
    case "left":
      return 1 / 2
    case "right":
      return 1 / 2
    case "top":
      return 2.5
    default:
      return 0
  }
}

function getArrowLeft(side: string) {
  switch (side) {
    case "inline-end":
      return 1
    case "inline-start":
      return 1
    case "left":
      return 1
    case "right":
      return 1
    default:
      return 0
  }
}

function getArrowTranslateY(side: string) {
  switch (side) {
    case "inline-end":
      return 1 / 2
    case "inline-start":
      return 1 / 2
    case "left":
      return 1 / 2
    case "right":
      return 1 / 2
    default:
      return 0
  }
}

function getArrowRight(side: string) {
  switch (side) {
    case "inline-start":
      return 1
    case "left":
      return 1
    case "right":
      return 1
    default:
      return 0
  }
}

function getArrowBottom(side: string) {
  switch (side) {
    case "top":
      return 2.5
    default:
      return 0
  }
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props & Pick<
  TooltipPrimitive.Positioner.Props,
  "align" | "alignOffset" | "side" | "sideOffset"
>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={getTooltipContentClassName(className, side)}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className={getArrowClassName(side)} />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
}