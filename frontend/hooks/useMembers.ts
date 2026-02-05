"use client";

import { useState, useEffect, useCallback } from "react";
import { listMembers, ServerMember } from "@/lib/api-server";
import { handleAuthError } from "@/lib/auth/utils";

export function useMembers(serverId: string | null) {
  const [members, setMembers] = useState<ServerMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await listMembers(id);
      setMembers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load members";
      if (errorMessage.includes("Authentication") || errorMessage.includes("Invalid token") || errorMessage.includes("Missing authorization")) {
        handleAuthError();
        return;
      }
      setError(errorMessage);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (serverId) {
      loadMembers(serverId);
    } else {
      setMembers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  const refresh = useCallback(() => {
    if (serverId) {
      loadMembers(serverId);
    }
  }, [serverId, loadMembers]);

  return {
    members,
    loading,
    error,
    refresh,
  };
}

