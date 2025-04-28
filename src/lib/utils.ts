import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Helps with setting up class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
