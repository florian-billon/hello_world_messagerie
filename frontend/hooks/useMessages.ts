"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  addMessageReaction as apiAddMessageReaction,
  deleteMessage as apiDeleteMessage,
  listMessages,
  Message,
  MessageReaction,
  removeMessageReaction as apiRemoveMessageReaction,
  updateMessage as apiUpdateMessage,
} from "@/lib/api-client";
import { handleAuthError, isAuthError, getErrorMessage } from "@/lib/auth/utils";
import { useWebSocket } from "./useWebSocket";
import { ServerEvent } from "@/lib/gateway";
import { useTranslation } from "@/lib/i18n";
import { isTauriWindow } from "@/lib/runtime";
import { 
  isPermissionGranted, 
  requestPermission, 
  sendNotification 
} from "@tauri-apps/plugin-notification";

/**
 * Hook pour gérer les messages d'un channel
 * Utilise WebSocket pour les nouveaux messages en temps réel
 * et REST pour charger l'historique initial
 */
export function useMessages(channelId: string | null, viewerId: string | null) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map()); // user_id -> username
  const { onEvent, subscribe, unsubscribe, sendMessage: wsSendMessage, typingStart, typingStop, isConnected } = useWebSocket();
  const subscribedRef = useRef(false);
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const toUiError = useCallback((err: unknown, fallbackKey: string): string => {
    const message = getErrorMessage(err, t(fallbackKey));
    if (message.startsWith("error.")) {
      return t(message);
    }
    return message;
  }, [t]);

  // Charger l'historique initial via REST
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
      setMessages(messagesArray.map((message) => ({ ...message, reactions: message.reactions ?? [] })));
    } catch (err) {
      const errorMessage = toUiError(err, "error.hooks.messages.load");
      setError(errorMessage);
      if (isAuthError(errorMessage)) {
        handleAuthError();
        return;
      }
      setMessages([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [toUiError]);

  // Charger l'historique quand le channel change
  useEffect(() => {
    if (channelId) {
      loadMessages(channelId, true);
      subscribedRef.current = false;
    } else {
      setMessages([]);
    }
  }, [channelId, loadMessages]);

  // S'abonner au channel via WebSocket quand connecté
  useEffect(() => {
    if (!channelId || !isConnected()) return;

    // S'abonner au channel
    subscribe(channelId);
    subscribedRef.current = true;

    return () => {
      unsubscribe(channelId);
      subscribedRef.current = false;
    };
  }, [channelId, subscribe, unsubscribe, isConnected]);

  // Écouter les événements WebSocket
  useEffect(() => {
    if (!channelId) return;

    const unsubscribe = onEvent((event: ServerEvent) => {
      switch (event.op) {
        case "MESSAGE_CREATE":
          // Nouveau message reçu
          if (event.d.channel_id === channelId) {
            setMessages((prev) => {
              // Éviter les doublons
              if (prev.some((m) => m.id === event.d.id)) {
                return prev;
              }
              return [...prev, { ...event.d, reactions: event.d.reactions ?? [] }];
            });

            // Desktop notification
            if (isTauriWindow() && event.d.author_id !== viewerId) {
              (async () => {
                let permission = await isPermissionGranted();
                if (!permission) {
                  const permissionResult = await requestPermission();
                  permission = permissionResult === "granted";
                }
                if (permission) {
                  sendNotification({ 
                    title: `${event.d.username} (#${channelId})`, 
                    body: event.d.content.length > 50 ? `${event.d.content.substring(0, 50)}...` : event.d.content,
                  });
                }
              })();
            }
          }
          break;

        case "MESSAGE_UPDATE":
          // Message modifié
          if (event.d.channel_id === channelId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === event.d.id
                  ? { ...m, content: event.d.content, edited_at: event.d.edited_at }
                  : m
              )
            );
          }
          break;

        case "MESSAGE_DELETE":
          // Message supprimé
          if (event.d.channel_id === channelId) {
            setMessages((prev) => prev.filter((m) => m.id !== event.d.id));
          }
          break;

        case "MESSAGE_REACTION_UPDATE":
          if (event.d.channel_id === channelId) {
            setMessages((prev) =>
              prev.map((m) => (m.id === event.d.id ? { ...m, reactions: event.d.reactions ?? [] } : m))
            );
          }
          break;

        case "TYPING_START":
          // Quelqu'un commence à taper
          if (event.d.channel_id === channelId) {
            setTypingUsers((prev) => {
              const next = new Map(prev);
              next.set(event.d.user_id, event.d.username);
              return next;
            });
            
            // Nettoyer le timeout existant si présent
            const existingTimeout = typingTimeoutRef.current.get(event.d.user_id);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
            }
            
            // Timeout automatique après 3 secondes
            const timeout = setTimeout(() => {
              setTypingUsers((prev) => {
                const next = new Map(prev);
                next.delete(event.d.user_id);
                return next;
              });
              typingTimeoutRef.current.delete(event.d.user_id);
            }, 3000);
            
            typingTimeoutRef.current.set(event.d.user_id, timeout);
          }
          break;

        case "TYPING_STOP":
          // Quelqu'un arrête de taper
          if (event.d.channel_id === channelId) {
            setTypingUsers((prev) => {
              const next = new Map(prev);
              next.delete(event.d.user_id);
              return next;
            });
            
            // Nettoyer le timeout
            const timeout = typingTimeoutRef.current.get(event.d.user_id);
            if (timeout) {
              clearTimeout(timeout);
              typingTimeoutRef.current.delete(event.d.user_id);
            }
          }
          break;

        case "PRESENCE_UPDATE":
          if (event.d.status === "offline") {
            setTypingUsers((prev) => {
              if (!prev.has(event.d.user_id)) return prev;
              const next = new Map(prev);
              next.delete(event.d.user_id);
              return next;
            });

            const timeout = typingTimeoutRef.current.get(event.d.user_id);
            if (timeout) {
              clearTimeout(timeout);
              typingTimeoutRef.current.delete(event.d.user_id);
            }
          }
          break;

        case "ERROR":
          // Erreur serveur
          if (event.d.code === "MESSAGE_ERROR") {
            setError(event.d.message);
      }
          break;
      }
    });

    return unsubscribe;
  }, [channelId, onEvent]);

  // Envoyer un message via WebSocket
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!channelId || !content.trim()) return false;

    // Vérifier que WebSocket est connecté
    if (!isConnected()) {
      setError(t("error.hooks.messages.notConnected"));
      return false;
    }

    try {
      setSending(true);
      setError(null);
      
      // Envoyer via WebSocket
      wsSendMessage(channelId, content.trim());
      
      // Le message sera ajouté automatiquement via MESSAGE_CREATE
      // Pas besoin de recharger
      return true;
    } catch (err) {
      const errorMessage = toUiError(err, "error.hooks.messages.send");
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  }, [channelId, wsSendMessage, isConnected, t, toUiError]);

  // Éditer un message (via REST API, WebSocket broadcast automatique)
  const updateMessage = useCallback(async (id: string, content: string): Promise<boolean> => {
    if (!channelId || !content.trim()) return false;

    let previousMessages: Message[] = [];

    try {
      setError(null);
      
      // Optimisme UI : mise à jour immédiate
      setMessages((prev) => {
        previousMessages = [...prev];
        return prev.map((m) =>
          m.id === id
            ? { ...m, content: content.trim(), edited_at: new Date().toISOString() }
            : m
        );
      });

      await apiUpdateMessage(id, content.trim());
      
      // Le WebSocket MESSAGE_UPDATE va mettre à jour avec les données du serveur
      // Pas besoin de recharger manuellement
      return true;
    } catch (err) {
      // Rollback en cas d'erreur
      if (previousMessages.length > 0) {
        setMessages(previousMessages);
      }
      
      const errorMessage = toUiError(err, "error.hooks.messages.update");
      if (isAuthError(errorMessage)) {
        handleAuthError();
        return false;
      }
      setError(errorMessage);
      return false;
    }
  }, [channelId, toUiError]);

  // Supprimer un message (via REST API, WebSocket broadcast automatique)
  const deleteMessage = useCallback(async (id: string): Promise<boolean> => {
    if (!channelId) return false;

    let previousMessages: Message[] = [];

    try {
      setError(null);
      
      // Optimisme UI : suppression immédiate
      setMessages((prev) => {
        previousMessages = [...prev];
        return prev.filter((m) => m.id !== id);
      });

      await apiDeleteMessage(id);
      
      // Le WebSocket MESSAGE_DELETE va confirmer la suppression
      // Pas besoin de recharger manuellement
      return true;
    } catch (err) {
      // Rollback en cas d'erreur
      if (previousMessages.length > 0) {
        setMessages(previousMessages);
      }
      
      const errorMessage = toUiError(err, "error.hooks.messages.delete");
      if (isAuthError(errorMessage)) {
        handleAuthError();
        return false;
      }
      setError(errorMessage);
      return false;
    }
  }, [channelId, toUiError]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string): Promise<boolean> => {
    if (!channelId || !viewerId || !emoji.trim()) return false;

    const normalizedEmoji = emoji.trim();
    const normalizedViewerId = viewerId.toLowerCase();
    const currentMessage = messages.find((message) => message.id === messageId);
    if (!currentMessage) return false;

    const currentReactions = currentMessage.reactions ?? [];
    const hasReaction = currentReactions.some(
      (reaction) => reaction.user_id.toLowerCase() === normalizedViewerId && reaction.emoji === normalizedEmoji
    );

    const previousMessages = messages;

    try {
      setError(null);

      setMessages((prev) =>
        prev.map((message) => {
          if (message.id !== messageId) return message;

          const reactions = message.reactions ?? [];

          if (hasReaction) {
            return {
              ...message,
              reactions: reactions.filter(
                (reaction) =>
                  !(reaction.user_id.toLowerCase() === normalizedViewerId && reaction.emoji === normalizedEmoji)
              ),
            };
          }

          const optimisticReaction: MessageReaction = {
            user_id: viewerId,
            emoji: normalizedEmoji,
            created_at: new Date().toISOString(),
          };

          return {
            ...message,
            reactions: [
              ...reactions.filter(
                (reaction) => reaction.user_id.toLowerCase() !== normalizedViewerId
              ),
              optimisticReaction,
            ],
          };
        })
      );

      if (hasReaction) {
        await apiRemoveMessageReaction(messageId, normalizedEmoji);
      } else {
        await apiAddMessageReaction(messageId, normalizedEmoji);
      }

      return true;
    } catch (err) {
      setMessages(previousMessages);

      const rawMessage = getErrorMessage(err, "");
      if (rawMessage.includes("HTTP 404")) {
        setError(null);
        return false;
      }

      const errorMessage = toUiError(err, "error.hooks.messages.reaction");
      if (isAuthError(errorMessage)) {
        handleAuthError();
        return false;
      }

      setError(errorMessage);
      return false;
    }
  }, [channelId, viewerId, messages, toUiError]);

  // Rafraîchir l'historique (utile pour resync après reconnexion)
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
    typingUsers,
    sendMessage,
    updateMessage,
    deleteMessage,
    toggleReaction,
    refresh,
    isConnected: isConnected(),
    typingStart,
    typingStop,
  };
}
