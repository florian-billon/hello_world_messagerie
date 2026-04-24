"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hasStoredToken, subscribeToTokenChanges } from "../token-storage";

type GuardMode = "protected" | "guest";

export function useRouteGuard(mode: GuardMode) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncGuard = () => {
      const authenticated = hasStoredToken();

      if (mode === "protected" && !authenticated) {
        setReady(false);
        router.replace("/login");
        return;
      }

      if (mode === "guest" && authenticated) {
        setReady(false);
        router.replace("/");
        return;
      }

      setReady(true);
    };

    syncGuard();
    return subscribeToTokenChanges(() => {
      syncGuard();
    });
  }, [mode, router]);

  return { ready };
}
