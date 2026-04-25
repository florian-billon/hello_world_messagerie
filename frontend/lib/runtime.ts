export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getWindowHostname(fallback = "localhost"): string {
  return isBrowser() ? window.location.hostname : fallback;
}

export function getWindowOrigin(fallback = "http://localhost"): string {
  return isBrowser() ? window.location.origin : fallback;
}

export function isTauriWindow(): boolean {
  if (!isBrowser()) return false;

  return (
    window.location.protocol === "tauri:" ||
    window.location.hostname === "tauri.localhost" ||
    window.location.hostname.endsWith(".tauri.localhost")
  );
}
