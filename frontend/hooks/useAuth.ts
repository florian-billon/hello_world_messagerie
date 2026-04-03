"use client";

import { useState, useEffect } from "react";
import { getMe, User } from "@/lib/api-server";
import { useTranslation } from "@/lib/i18n";

export function useAuth() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const userData = await getMe();
        setUser(userData);
      } catch (err) {
        console.error("Erreur auth:", err);
        setError(t("error.hooks.authInvalidSession"));
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [t]);

  return { user, loading, error };
}