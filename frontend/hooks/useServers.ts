"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listServers,
  createServer as apiCreateServer,
  Server,
} from "@/lib/api-server";
import { handleAuthError } from "@/lib/auth/utils";

export function useServers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listServers();
      setServers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load servers";
      if (errorMessage.includes("Authentication") || errorMessage.includes("Invalid token") || errorMessage.includes("Missing authorization")) {
        setServers([]);
        setError(null);
        handleAuthError();
      } else {
        setError(errorMessage);
        setServers([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectServer = useCallback((server: Server | null) => {
    setSelectedServer(server);
  }, []);

  const createServer = useCallback(async (name: string): Promise<Server | null> => {
    try {
      setError(null);
      const newServer = await apiCreateServer(name);
      await loadServers();
      setSelectedServer(newServer);
      return newServer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create server";
      if (errorMessage.includes("Authentication") || errorMessage.includes("Invalid token") || errorMessage.includes("Missing authorization")) {
        handleAuthError();
        return null;
      }
      setError(errorMessage);
      return null;
    }
  }, [loadServers]);

  const refresh = useCallback(() => {
    loadServers();
  }, [loadServers]);

  return {
    servers,
    selectedServer,
    loading,
    error,
    selectServer,
    createServer,
    refresh,
  };
}

