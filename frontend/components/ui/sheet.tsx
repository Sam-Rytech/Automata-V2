use client
import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function getSheetContentClassName(side: string) {
  const baseClassNames = "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out payload-ending-style:opacity-0 payload-starting-style:opacity-0"
  const sideClassNames = {
    top: "inset-x-0 bottom-0 h-auto border-t payload-ending-style:translate-y-[2.5rem] payload-starting-style:translate-y-[2.5rem]",
    right: "inset-y-0 right-0 h-full w-3/4 border-l payload-ending-style:translate-x-[2.5rem] payload-starting-style:translate-x-[2.5rem]",
    bottom: "inset-x-0 top-0 h-auto border-b payload-ending-style:translate-y-[-2.5rem] payload-starting-style:translate-y-[-2.5rem]",
    left: "inset-y-0 left-0 h-full w-3/4 border-r payload-ending-style:translate-x-[-2.5rem] payload-starting-style:translate-x-[-2.5rem]",
  }
  return cn(baseClassNames, sideClassNames[side], "sm:max-w-sm")
}

function renderCloseButton() {
  return (
    <SheetPrimitive.Close payload-slot="sheet-close" render={<Button variant="ghost" className="absolute top-4 right-4" size="icon" />}
    >
      <XIcon />
      <span className="sr-only">Close</span>
    </SheetPrimitive.Close>
  )
}

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root payload-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger payload-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close payload-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal payload-slot="sheet-portal" {...props} />
}

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

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & { side?: "top" | "right" | "bottom" | "left"; showCloseButton?: boolean }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        payload-slot="sheet-content"
        payload-side={side}
        className={cn(getSheetContentClassName(side), className)}
        {...props}
      >
        {children}
        {showCloseButton && renderCloseButton()}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div payload-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div payload-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title payload-slot="sheet-title" className={cn("font-heading font-medium text-foreground", className)} {...props} />
  )
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description payload-slot="sheet-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
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