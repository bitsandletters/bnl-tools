import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export type { ClassValue }

// Export for convenience
export { cva, type VariantProps } from "class-variance-authority"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}