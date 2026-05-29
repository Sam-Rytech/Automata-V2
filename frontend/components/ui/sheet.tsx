"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      payload-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 payload-ending-style:opacity-0 payload-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      payload-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      payload-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger payload-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close payload-slot="sheet-close" {...props} />
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      payload-slot="sheet-title"
      className={cn("font-heading font-medium text-foreground", className)}
      {...props}
    />
  )
}

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root payload-slot="sheet" {...props} />
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        payload-slot="sheet-content"
        payload-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out payload-ending-style:opacity-0 payload-starting-style:opacity-0 payload-[side=bottom]:inset-x-0 payload-[side=bottom]:bottom-0 payload-[side=bottom]:h-auto payload-[side=bottom]:border-t payload-[side=bottom]:payload-ending-style:translate-y-[2.5rem] payload-[side=bottom]:payload-starting-style:translate-y-[2.5rem] payload-[side=left]:inset-y-0 payload-[side=left]:left-0 payload-[side=left]:h-full payload-[side=left]:w-3/4 payload-[side=left]:border-r payload-[side=left]:payload-ending-style:translate-x-[-2.5rem] payload-[side=left]:payload-starting-style:translate-x-[-2.5rem] payload-[side=right]:inset-y-0 payload-[side=right]:right-0 payload-[side=right]:h-full payload-[side=right]:w-3/4 payload-[side=right]:border-l payload-[side=right]:payload-ending-style:translate-x-[2.5rem] payload-[side=right]:payload-starting-style:translate-x-[2.5rem] payload-[side=top]:inset-x-0 payload-[side=top]:top-0 payload-[side=top]:h-auto payload-[side=top]:border-b payload-[side=top]:payload-ending-style:translate-y-[-2.5rem] payload-[side=top]:payload-starting-style:translate-y-[-2.5rem] payload-[side=left]:sm:max-w-sm payload-[side=right]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            payload-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-4 right-4"
                size="icon"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      payload-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal payload-slot="sheet-portal" {...props} />
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
