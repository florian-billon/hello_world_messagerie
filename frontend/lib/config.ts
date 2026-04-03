/**
 * Configuration centralisée de l'application
 */

const defaultHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

function resolveApiUrl(): string {
	if (!configuredApiUrl) {
		return `http://${defaultHost}:3001`;
	}

	if (typeof window !== "undefined") {
		try {
			const parsed = new URL(configuredApiUrl);
			const isLocalHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
			const isLanAccess = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";

			if (isLocalHost && isLanAccess) {
				parsed.hostname = window.location.hostname;
				return parsed.toString().replace(/\/$/, "");
			}
		} catch {
			return configuredApiUrl;
		}
	}

	return configuredApiUrl;
}

// Utilisation du préfixe NEXT_PUBLIC pour que Vercel puisse transmettre la variable au navigateur
export const API_URL = resolveApiUrl();
