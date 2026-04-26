"use client";

import { clearToken } from "./client";

/**
 * Redirige vers la page de login en supprimant le token
 */
export async function handleAuthError() {
  await clearToken();
  // Éviter la boucle de redirection si on est déjà sur une page d'auth
  if (typeof window !== "undefined" && 
      !window.location.pathname.includes("/login") && 
      !window.location.pathname.includes("/register")) {
    window.location.href = "/login";
  }
}

/**
 * Vérifie si un message d'erreur correspond à une erreur d'authentification
 */
export function isAuthError(errorMessage: string): boolean {
  return (
    errorMessage.includes("error.authRequired") ||
    errorMessage.includes("Authentication") ||
    errorMessage.includes("Invalid token") ||
    errorMessage.includes("Missing authorization")
  );
}

/**
 * Extrait le message d'erreur d'une exception
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}
