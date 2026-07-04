import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const combineClassNames = (inputs: ClassValue[]) => clsx(inputs)
const mergeClassNames = (classNames: string) => twMerge(classNames)

export function cn(...inputs: ClassValue[]) {
  const combinedClassNames = combineClassNames(inputs)
  return mergeClassNames(combinedClassNames)
}