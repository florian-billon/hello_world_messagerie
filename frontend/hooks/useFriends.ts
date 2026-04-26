"use client";

import { useCallback, useEffect, useState } from "react";
import { Friend, listFriends as apiListFriends } from "@/lib/api-client";
import { handleAuthError, isAuthError, getErrorMessage } from "@/lib/auth/utils";
import { hasStoredToken } from "@/lib/token-storage";
import { useTranslation } from "@/lib/i18n";

export function useFriends(userId: string | null = null) {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<Friend[]>([]);

  const refreshFriends = useCallback(async () => {
    if (!hasStoredToken()) return;
    try {
      const data = await apiListFriends();
      setFriends(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err, t("error.hooks.friends.load"));
      if (isAuthError(errorMessage)) {
        setFriends([]);
        handleAuthError();
      } else {
        setFriends([]);
        console.error("Erreur lors du chargement des amis:", err);
      }
    }
  }, [t]);

  useEffect(() => {
    refreshFriends();
  }, [refreshFriends, userId]);

  return {
    friends,
    refreshFriends,
  };
}
