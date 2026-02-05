"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listChannels,
  createChannel as apiCreateChannel,
  Channel,
} from "@/lib/api-server";
import { handleAuthError } from "@/lib/auth/utils";

export function useChannels(serverId: string | null) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChannels = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await listChannels(id);
      setChannels(data);
      if (data.length > 0) {
        setSelectedChannel(data[0]);
      } else {
        setSelectedChannel(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load channels";
      if (errorMessage.includes("Authentication") || errorMessage.includes("Invalid token") || errorMessage.includes("Missing authorization")) {
        handleAuthError();
        return;
      }
      setError(errorMessage);
      setChannels([]);
      setSelectedChannel(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (serverId) {
      loadChannels(serverId);
    } else {
      setChannels([]);
      setSelectedChannel(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  const selectChannel = useCallback((channel: Channel | null) => {
    setSelectedChannel(channel);
  }, []);

  const createChannel = useCallback(async (name: string): Promise<Channel | null> => {
    if (!serverId) return null;
    
    try {
      setError(null);
      const newChannel = await apiCreateChannel(serverId, name);
      await loadChannels(serverId);
      setSelectedChannel(newChannel);
      return newChannel;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create channel";
      if (errorMessage.includes("Authentication") || errorMessage.includes("Invalid token") || errorMessage.includes("Missing authorization")) {
        handleAuthError();
        return null;
      }
      setError(errorMessage);
      return null;
    }
  }, [serverId, loadChannels]);

  return {
    channels,
    selectedChannel,
    loading,
    error,
    selectChannel,
    createChannel,
  };
}

