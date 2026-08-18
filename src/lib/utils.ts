//this was creted by shandcn , exports a cn fucntion
//cn is a function that combines tailwind css and provides utility fucntoin to merge conditoinal styling within tailwind ss


import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
