"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  listMessages,
  sendMessage as apiSendMessage,
  Message,
} from "@/lib/api-server";
import { handleAuthError } from "@/lib/auth/utils";

export function useMessages(channelId: string | null, pollingInterval = 3000) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const loadMessages = useCallback(async (id: string, showLoading = false) => {
    if (!id) {
      setMessages([]);
      return;
    }
    
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const data = await listMessages(id);
      const messagesArray = Array.isArray(data) ? data : [];
      setMessages(messagesArray);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load messages";
      setError(errorMessage);
      if (errorMessage.includes("Authentication") || errorMessage.includes("Invalid token") || errorMessage.includes("Missing authorization")) {
        handleAuthError();
        return;
      }
      setMessages([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (channelId) {
      loadMessages(channelId, true);
    } else {
      setMessages([]);
    }
  }, [channelId, loadMessages]);

  useEffect(() => {
    if (!channelId) return;

    pollingRef.current = setInterval(() => {
      loadMessages(channelId, false);
    }, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [channelId, pollingInterval, loadMessages]);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!channelId || !content.trim()) return false;

    try {
      setSending(true);
      setError(null);
      await apiSendMessage(channelId, content.trim());
      await loadMessages(channelId, false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      if (errorMessage.includes("Authentication") || errorMessage.includes("Invalid token") || errorMessage.includes("Missing authorization")) {
        handleAuthError();
        return false;
      }
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  }, [channelId, loadMessages]);

  const refresh = useCallback(() => {
    if (channelId) {
      loadMessages(channelId, false);
    }
  }, [channelId, loadMessages]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    refresh,
  };
}

