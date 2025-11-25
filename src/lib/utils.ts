import { twMerge } from "tailwind-merge";

// Simple type for class values (no clsx needed)
type ClassValue = string | number | null | undefined | ClassValue[];

/**
 * Flatten nested class value arrays into a single string.
 */
function flattenClassValues(values: ClassValue[]): (string | number)[] {
  const result: (string | number)[] = [];
  for (const val of values) {
    if (Array.isArray(val)) {
      result.push(...flattenClassValues(val));
    } else if (val !== null && val !== undefined && val !== "") {
      result.push(val);
    }
  }
  return result;
}

/**
 * Utility to merge Tailwind class names safely.
 * Replaces the need for clsx + tailwind-merge combo.
 */
export function cn(...inputs: ClassValue[]): string {
  const flat = flattenClassValues(inputs);
  return twMerge(flat.join(" "));
}
