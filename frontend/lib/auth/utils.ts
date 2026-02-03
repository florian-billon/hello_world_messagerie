"use client";

export function handleAuthError() {
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.href = "/login";
}

