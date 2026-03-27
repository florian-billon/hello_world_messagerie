"use client";

import { useEffect, useRef, useCallback } from "react";
import { getGateway, ServerEvent } from "@/lib/gateway";
import { API_URL } from "@/lib/config";
import { getTokenForWs } from "@/lib/auth/actions";

/**
 * Hook pour gérer la connexion WebSocket globale
 */
export function useWebSocket() {
  const gatewayRef = useRef<ReturnType<typeof getGateway> | null>(null);
  const handlersRef = useRef<Set<(event: ServerEvent) => void>>(new Set());

  useEffect(() => {
    const socketUrl = API_URL.replace(/^http/, 'ws');

    const gateway = getGateway(socketUrl);
    gatewayRef.current = gateway;

    const connect = async () => {
      const token = await getTokenForWs();

      if (token) {
        gateway.connect(token);
      } else {
        console.warn("[useWebSocket] No token found");
      }
    };

    connect();

    return () => {
      // Singleton partagé, pas de déconnexion ici
    };
  }, []);

  const onEvent = useCallback((handler: (event: ServerEvent) => void) => {
    if (!gatewayRef.current) return () => {};
    handlersRef.current.add(handler);
    const unsubscribe = gatewayRef.current.onEvent(handler);
    return () => {
      handlersRef.current.delete(handler);
      unsubscribe();
    };
  }, []);

  const subscribe = useCallback((channelId: string) => {
    gatewayRef.current?.subscribe(channelId);
  }, []);

  const unsubscribe = useCallback((channelId: string) => {
    gatewayRef.current?.unsubscribe(channelId);
  }, []);

  const sendMessage = useCallback((channelId: string, content: string) => {
    gatewayRef.current?.sendMessage(channelId, content);
  }, []);

  const typingStart = useCallback((channelId: string) => {
    gatewayRef.current?.typingStart(channelId);
  }, []);

  const typingStop = useCallback((channelId: string) => {
    gatewayRef.current?.typingStop(channelId);
  }, []);

  const isConnected = useCallback(() => {
    return gatewayRef.current?.isConnected() ?? false;
  }, []);

  return {
    onEvent,
    subscribe,
    unsubscribe,
    sendMessage,
    typingStart,
    typingStop,
    isConnected,
  };
}
