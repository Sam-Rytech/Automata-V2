"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        style: {
          marginTop: '40vh', // Pushes the toast perfectly into the center-middle
        },
        classNames: {
          // Base styling for the modal card
          toast: "group toast group-[.toaster]:bg-[#0F0F1A] group-[.toaster]:text-white group-[.toaster]:border-y group-[.toaster]:border-r group-[.toaster]:border-y-white/5 group-[.toaster]:border-r-white/5 group-[.toaster]:shadow-[0_0_50px_rgba(0,0,0,0.8)] font-mono text-[11px] uppercase tracking-widest rounded-none p-5 w-[380px] border-l-4 pointer-events-auto",

          // Subtext styling
          description: "group-[.toast]:text-white/40 group-[.toast]:text-[9px] group-[.toast]:mt-1.5",

          // Color-coded indicators (Thick left border + Icon color + Text color)
          error: "group-[.toaster]:border-l-[#EF4444] group-[.toast]:text-[#EF4444]",
          success: "group-[.toaster]:border-l-[#22C55E] group-[.toast]:text-[#22C55E]",
          warning: "group-[.toaster]:border-l-[#F59E0B] group-[.toast]:text-[#F59E0B]",
          info: "group-[.toaster]:border-l-[#E91E8C] group-[.toast]:text-[#E91E8C]",

          // Colorize the built-in SVG icons to match the status
          icon: "group-data-[type=error]:text-[#EF4444] group-data-[type=success]:text-[#22C55E] group-data-[type=warning]:text-[#F59E0B] group-data-[type=info]:text-[#E91E8C]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }