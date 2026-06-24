"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delay = 0,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      payload-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root payload-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger payload-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
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
          payload-slot="tooltip-content"
          className={cn(
            "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-payload-[slot=kbd]:pr-1.5 payload-[side=bottom]:slide-in-from-top-2 payload-[side=inline-end]:slide-in-from-left-2 payload-[side=inline-start]:slide-in-from-right-2 payload-[side=left]:slide-in-from-right-2 payload-[side=right]:slide-in-from-left-2 payload-[side=top]:slide-in-from-bottom-2 **:payload-[slot=kbd]:relative **:payload-[slot=kbd]:isolate **:payload-[slot=kbd]:z-50 **:payload-[slot=kbd]:rounded-sm payload-[state=delayed-open]:animate-in payload-[state=delayed-open]:fade-in-0 payload-[state=delayed-open]:zoom-in-95 payload-open:animate-in payload-open:fade-in-0 payload-open:zoom-in-95 payload-closed:animate-out payload-closed:fade-out-0 payload-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground payload-[side=bottom]:top-1 payload-[side=inline-end]:top-1/2! payload-[side=inline-end]:-left-1 payload-[side=inline-end]:-translate-y-1/2 payload-[side=inline-start]:top-1/2! payload-[side=inline-start]:-right-1 payload-[side=inline-start]:-translate-y-1/2 payload-[side=left]:top-1/2! payload-[side=left]:-right-1 payload-[side=left]:-translate-y-1/2 payload-[side=right]:top-1/2! payload-[side=right]:-left-1 payload-[side=right]:-translate-y-1/2 payload-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
