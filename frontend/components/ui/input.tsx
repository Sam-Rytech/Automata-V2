import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

const getInputClassName = (className: string, type: string, isValid: boolean, isDisabled: boolean, isFocused: boolean) => {
  const baseClass = "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none";
  const fileInputClass = "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground";
  const focusClass = isFocused ? "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" : "";
  const disabledClass = isDisabled ? "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" : "";
  const invalidClass = !isValid ? "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20" : "";
  const darkModeClass = "dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";
  return cn(baseClass, fileInputClass, focusClass, disabledClass, invalidClass, darkModeClass, className);
};

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={getInputClassName(className, type, !props['aria-invalid'], props.disabled, props.focus)}
      {...props}
    />
  );
}
export { Input };
