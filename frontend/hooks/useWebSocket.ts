"use client";

import { useEffect, useRef, useCallback } from "react";
import { getGateway, ServerEvent } from "@/lib/gateway";
import { API_URL } from "@/lib/config";

/**
 * Hook pour gérer la connexion WebSocket globale
 * S'initialise automatiquement avec le token de l'utilisateur
 */
export function useWebSocket() {
  const gatewayRef = useRef<ReturnType<typeof getGateway> | null>(null);
  const handlersRef = useRef<Set<(event: ServerEvent) => void>>(new Set());

  useEffect(() => {
    const gateway = getGateway(API_URL);
    gatewayRef.current = gateway;

    // Récupérer le token depuis les cookies et connecter
    const connect = () => {
      if (typeof document === "undefined") return;
      
      const cookies = document.cookie.split(";");
      let token: string | null = null;
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "token") {
          token = value || null;
          break;
        }
      }
      
      if (token) {
        gateway.connect(token);
      }
    };

    connect();

    return () => {
      // Ne pas déconnecter ici car c'est un singleton partagé
      // La déconnexion se fera lors du logout
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

