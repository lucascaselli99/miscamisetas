import { clsx, type ClassValue } from "clsx";

/** Helper para combinar clases condicionalmente (wrapper fino sobre clsx). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
