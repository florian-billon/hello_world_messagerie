export type UserStatus = "online" | "offline" | "dnd" | "invisible";

export const STATUS_COLORS: Record<UserStatus, string> = {
  online: "bg-green-500",
  offline: "bg-gray-500",
  dnd: "bg-red-500",
  invisible: "bg-gray-400",
};

/**
 * Normalise un statut (insensible à la casse, fallback sur offline)
 */
export function normalizeStatus(status: string | null | undefined): UserStatus {
  const s = status?.toLowerCase() || "offline";
  if (["online", "offline", "dnd", "invisible"].includes(s)) {
    return s as UserStatus;
  }
  return "offline";
}

/**
 * Retourne la couleur CSS pour un statut
 */
export function getStatusColor(status: string | null | undefined): string {
  return STATUS_COLORS[normalizeStatus(status)];
}

/**
 * Retourne la clé i18n pour un statut (à utiliser avec t())
 */
export function getStatusKey(status: string | null | undefined): string {
  return `status.${normalizeStatus(status)}`;
}
