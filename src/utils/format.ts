/** Formatea un numero como moneda. Si no se reconoce la moneda, cae a un formato generico. */
export function formatCurrency(amount: number, currency = "ARS") {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("es-AR")}`;
  }
}

/** Formatea una fecha ISO ("YYYY-MM-DD" o timestamp) a formato legible es-AR. */
export function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Formatea una fecha corta, ej. "ago 2026". */
export function formatMonthYear(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-AR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Devuelve las iniciales de un nombre (hasta 2 letras), para avatars por defecto. */
export function getInitials(name: string | null | undefined, fallback = "?") {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || fallback;
}
