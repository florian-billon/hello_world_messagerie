"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useServers } from "@/hooks";
import { useWebSocket } from "@/hooks/useWebSocket";
import { normalizeAvatarUrl, getAvatar } from "@/lib/avatar";
import { getStatusColor, getStatusKey } from "@/lib/presence";
import { useTranslation } from "@/lib/i18n";
import MessageReactions from "@/components/chat/MessageReactions";
import GifPicker from "@/components/chat/GifPicker";
import PublicProfileCard from "@/components/PublicProfileCard";
import SmartImg from "@/components/SmartImg";
import { logout } from "@/lib/auth/actions";
import Button from "@/components/ui/Button";
import {
  addDirectMessageReaction,
  createDirectConversation,
  DirectConversation,
  DirectMessage,
  listDirectConversations,
  listDirectMessages,
  MessageReaction,
  removeDirectMessageReaction,
  searchUsers,
  sendDirectMessage,
  UserSearchResult,
} from "@/lib/api-server";

const SCROLL_BOTTOM_THRESHOLD_PX = 80;

function sortDirectMessagesChronologically(items: DirectMessage[]): DirectMessage[] {
  return [...items].sort((left, right) => {
    const leftTimestamp = new Date(left.created_at).getTime();
    const rightTimestamp = new Date(right.created_at).getTime();

    if (leftTimestamp !== rightTimestamp) {
      return leftTimestamp - rightTimestamp;
    }

    return left.id.localeCompare(right.id);
  });
}

function isGifMessage(content: string): boolean {
  return content.includes("giphy.com");
}

function DirectMessagesPageContent() {
  const { t, locale } = useTranslation();
  const { user: currentUser } = useAuth();
  const { servers, selectServer } = useServers();
  const { onEvent } = useWebSocket();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ÉTATS
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPublicUserId, setSelectedPublicUserId] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const pendingScrollBehaviorRef = useRef<ScrollBehavior | null>(null);
  const shouldStickToBottomRef = useRef(true);

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId);
  const requestedUsername = searchParams.get("username");
  const selectedConversationAvatar =
    normalizeAvatarUrl(selectedConversation?.avatar_url) ||
    getAvatar(selectedConversation?.recipient_id || "", currentUser);

  const scrollMessagesToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  const updateStickToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldStickToBottomRef.current = distanceToBottom <= SCROLL_BOTTOM_THRESHOLD_PX;
  }, []);

  const resetNewConversationModal = () => {
    setShowNewChatModal(false);
    setSearchUsername("");
    setModalError(null);
    setSearchResults([]);
    setSearchLoading(false);
  };

  const selectConversation = useCallback((conversation: DirectConversation) => {
    setConversations((prev) => {
      const exists = prev.find((current) => current.id === conversation.id);
      return exists ? prev : [conversation, ...prev];
    });
    setSelectedConversationId(conversation.id);
  }, []);

  const openConversation = useCallback(
    async (targetUsername: string, shouldSelect = true) => {
      const conversation = await createDirectConversation(targetUsername.trim());
      if (shouldSelect) {
        selectConversation(conversation);
      }
      return conversation;
    },
    [selectConversation]
  );

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await listDirectConversations();
        setConversations(data);
        setError(null);
      } catch (error) {
        console.error("Erreur lors du chargement des conversations:", error);
        setError("Impossible de charger les conversations.");
      }
    };

    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  useEffect(() => {
    shouldStickToBottomRef.current = true;
    pendingScrollBehaviorRef.current = "auto";
  }, [selectedConversationId]);

  useEffect(() => {
    let cancelled = false;

    const fetchMessages = async () => {
      if (!selectedConversationId) {
        setMessages([]);
        return;
      }

      try {
        const data = await listDirectMessages(selectedConversationId);
        if (!cancelled) {
          setMessages(
            sortDirectMessagesChronologically(
              data.map((message) => ({ ...message, reactions: message.reactions ?? [] }))
            )
          );
          setError(null);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des messages privés:", error);
        if (!cancelled) {
          setError("Impossible de charger les messages privés.");
        }
      }
    };

    void fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId || messages.length === 0) {
      return;
    }

    if (!shouldStickToBottomRef.current && pendingScrollBehaviorRef.current === null) {
      return;
    }

    const behavior = pendingScrollBehaviorRef.current ?? "smooth";
    const animationFrame = window.requestAnimationFrame(() => {
      scrollMessagesToBottom(behavior);
      pendingScrollBehaviorRef.current = null;
      shouldStickToBottomRef.current = true;
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [messages, scrollMessagesToBottom, selectedConversationId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    updateStickToBottom();
  }, [messages.length, selectedConversationId, updateStickToBottom]);

  useEffect(() => {
    if (!requestedUsername || !currentUser) {
      return;
    }

    let cancelled = false;

    const openConversationFromQuery = async () => {
      try {
        const newConv = await openConversation(requestedUsername, false);
        if (!cancelled) {
          selectConversation(newConv);
          router.replace("/messages");
        }
      } catch (queryError) {
        console.error("Erreur lors de l'ouverture auto de la conversation:", queryError);
        if (!cancelled) {
          setError("Impossible d'ouvrir la conversation privée.");
          router.replace("/messages");
        }
      }
    };

    openConversationFromQuery();

    return () => {
      cancelled = true;
    };
  }, [currentUser, openConversation, requestedUsername, router, selectConversation]);

  useEffect(() => {
    const unsubscribe = onEvent((event) => {
      switch (event.op) {
        case "DIRECT_MESSAGE_CREATE": {
          const message = { ...event.d, reactions: event.d.reactions ?? [] };
          const shouldAutoScroll = shouldStickToBottomRef.current || message.author_id === currentUser?.id;

          setMessages((prev) => {
            if (prev.some((current) => current.id === message.id)) {
              return prev;
            }

            if (selectedConversationId && message.dm_id === selectedConversationId) {
              if (shouldAutoScroll) {
                pendingScrollBehaviorRef.current = "smooth";
              }

              return sortDirectMessagesChronologically([...prev, message]);
            }

            return prev;
          });

          setConversations((prev) => {
            const existing = prev.find((conversation) => conversation.id === message.dm_id);
            if (!existing) {
              void listDirectConversations()
                .then((data) => {
                  setConversations(data);
                })
                .catch((conversationError) => {
                  console.error(
                    "Erreur lors du rafraichissement des conversations privees:",
                    conversationError
                  );
                });
              return prev;
            }

            return [existing, ...prev.filter((conversation) => conversation.id !== message.dm_id)];
          });
          break;
        }
        case "DIRECT_MESSAGE_REACTION_UPDATE": {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === event.d.id && message.dm_id === event.d.dm_id
                ? { ...message, reactions: event.d.reactions ?? [] }
                : message
            )
          );
          break;
        }
      }
    });

    return unsubscribe;
  }, [currentUser?.id, onEvent, selectedConversationId]);

  useEffect(() => {
    if (!showNewChatModal) {
      return;
    }

    const normalizedQuery = searchUsername.trim();

    if (!normalizedQuery) {
      setSearchResults([]);
      setSearchLoading(false);
      setModalError(null);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const users = await searchUsers(normalizedQuery);
        if (!cancelled) {
          setSearchResults(users);
          setModalError(null);
        }
      } catch (searchError) {
        console.error("Erreur lors de la recherche d'utilisateurs:", searchError);
        if (!cancelled) {
          setSearchResults([]);
          setModalError("Impossible de rechercher des utilisateurs.");
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchUsername, showNewChatModal]);

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUsername =
      searchResults.find((candidate) => candidate.username === searchUsername.trim())?.username ||
      searchResults[0]?.username ||
      searchUsername.trim();

    if (!targetUsername) return;

    try {
      await openConversation(targetUsername);
      resetNewConversationModal();
      setError(null);
    } catch (conversationError) {
      console.error("Erreur technique lors du lancement de la conversation:", conversationError);
      setModalError("Utilisateur introuvable ou conversation impossible.");
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversationId || !messageInput.trim()) return;

    try {
      const sentMessage = await sendDirectMessage(selectedConversationId, messageInput.trim());
      pendingScrollBehaviorRef.current = "smooth";
      setMessages((prev) =>
        sortDirectMessagesChronologically([
          ...prev,
          { ...sentMessage, reactions: sentMessage.reactions ?? [] },
        ])
      );
      setMessageInput("");
      setError(null);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message privé:", error);
      setError("Impossible d'envoyer le message privé.");
    }
  };

  const handleSendGif = async (gifUrl: string) => {
    if (!selectedConversationId) return;

    try {
      const sentMessage = await sendDirectMessage(selectedConversationId, gifUrl);
      pendingScrollBehaviorRef.current = "smooth";
      setMessages((prev) =>
        sortDirectMessagesChronologically([
          ...prev,
          { ...sentMessage, reactions: sentMessage.reactions ?? [] },
        ])
      );
      setError(null);
      setShowGifPicker(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi du GIF privé:", error);
      setError("Impossible d'envoyer le GIF privé.");
    }
  };

  const toggleDirectReaction = async (messageId: string, emoji: string): Promise<boolean> => {
    if (!currentUser?.id || !emoji.trim()) return false;

    const normalizedEmoji = emoji.trim();
    const normalizedViewerId = currentUser.id.toLowerCase();
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
            user_id: currentUser.id,
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
        await removeDirectMessageReaction(messageId, normalizedEmoji);
      } else {
        await addDirectMessageReaction(messageId, normalizedEmoji);
      }

      return true;
    } catch (reactionError) {
      setMessages(previousMessages);
      console.error("Erreur lors de la reaction du message privé:", reactionError);
      setError("Impossible de mettre a jour la reaction.");
      return false;
    }
  };

  return (
    <main className="flex w-full h-screen overflow-hidden">
      {/* ========== SERVER SIDEBAR ========== */}
      <aside className="w-[72px] bg-[rgba(0,0,0,0.95)] border-r border-[#4fdfff]/20 flex flex-col items-center py-3 gap-2">
        <button
          onClick={() => router.push("/")}
          className="w-12 h-12 rounded-xl bg-[#4fdfff] text-black border border-[#4fdfff]/50 flex items-center justify-center mb-2 shadow-[0_0_12px_rgba(79,223,255,0.6)]"
        >
          <Image src="/logo.png" alt="HW" width={32} height={32} />
        </button>
        <div className="w-8 h-[2px] bg-[#4fdfff]/20 rounded-full" />
        <div className="flex-1 w-full overflow-y-auto flex flex-col items-center gap-2 py-2">
          {servers.map((server) => (
            <button
              key={server.id}
              onClick={() => { selectServer(server); router.push("/"); }}
              className="w-12 h-12 rounded-[24px] bg-[rgba(20,30,40,0.8)] text-[#4fdfff] flex items-center justify-center text-lg font-bold hover:bg-[#4fdfff]/20 hover:rounded-xl transition-all"
            >
              {server.name.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      </aside>

      {/* ========== DM SIDEBAR ========== */}
      <aside className="w-60 bg-[rgba(5,10,15,0.95)] border-r border-[#4fdfff]/20 flex flex-col min-h-0">
        <div className="h-12 px-4 flex items-center border-b border-[#4fdfff]/30 bg-[rgba(0,0,0,0.3)]">
           <div className="relative w-full">
            <input 
                type="text" 
                placeholder="Trouver une conversation" 
                className="w-full bg-black/40 border border-[#4fdfff]/20 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#4fdfff]/50"
            />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
          <div className="px-2 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">Messages Directs</span>
            {/* BOUTON + POUR NOUVELLE CONVERSATION */}
            <button 
                onClick={() => setShowNewChatModal(true)}
                className="text-white/50 hover:text-[#4fdfff] transition-colors"
                title="Nouvelle conversation"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
          </div>

          {conversations.length === 0 && (
            <p className="text-[11px] text-white/20 text-center mt-4 italic">Aucune conversation active</p>
          )}

          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded transition-colors ${
                selectedConversationId === conv.id
                  ? "bg-[#4fdfff]/15 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="relative flex-shrink-0">
                <SmartImg
                  src={normalizeAvatarUrl(conv.avatar_url) || getAvatar(conv.recipient_id, currentUser)}
                  alt={conv.username}
                  className="w-8 h-8 rounded-full border border-[#4fdfff]/30 object-cover"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[rgba(5,10,15,0.95)] rounded-full ${getStatusColor(conv.status)}`}
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{conv.username}</p>
                <p className="text-[10px] uppercase text-white/35">{t(getStatusKey(conv.status))}</p>
              </div>
            </button>
          ))}
        </div>

        {/* User Footer */}
        <div className="h-14 px-2 flex items-center gap-2 bg-[rgba(0,0,0,0.5)] border-t border-[#4fdfff]/20">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <SmartImg src={getAvatar(currentUser?.id || "", currentUser)} alt="Avatar" className="w-8 h-8 rounded-full border border-[#4fdfff]/50" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{currentUser?.username}</p>
                    <p className="text-[10px] text-[#4fdfff] font-mono uppercase">{t(getStatusKey(currentUser?.status))}</p>
                </div>
            </div>
            <button onClick={() => logout()} className="p-2 text-[#ff3333] hover:bg-[#ff3333]/10 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
            </button>
        </div>
      </aside>

      {/* ========== CHAT CENTER ========== */}
      <div className="flex-1 min-w-0 flex flex-col bg-[rgba(10,15,20,0.98)]">
        {selectedConversationId ? (
           <div className="flex-1 min-h-0 flex flex-col">
              <header className="h-12 px-4 flex items-center border-b border-[#4fdfff]/20 bg-[rgba(0,0,0,0.3)] shadow-sm">
                {selectedConversation ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <SmartImg
                        src={selectedConversationAvatar}
                        alt={selectedConversation.username}
                        className="w-8 h-8 rounded-full object-cover border border-[#4fdfff]/40"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[rgba(10,15,20,0.98)] rounded-full ${getStatusColor(selectedConversation.status)}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">@{selectedConversation.username}</p>
                      <p className="text-[10px] font-mono uppercase text-white/40">
                        {t(getStatusKey(selectedConversation.status))}
                      </p>
                    </div>
                  </div>
                ) : (
                  <h1 className="text-white font-semibold text-sm">Conversation</h1>
                )}
              </header>
              <div
                ref={messagesContainerRef}
                onScroll={updateStickToBottom}
                className="flex-1 min-h-0 overflow-y-auto p-4"
              >
                {error && <p className="text-sm text-[#ff3333]">{error}</p>}
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-20 h-20 rounded-full bg-[#4fdfff]/10 border-2 border-[#4fdfff]/30 flex items-center justify-center mb-4 overflow-hidden">
                      <SmartImg
                        src={selectedConversationAvatar}
                        alt={selectedConversation?.username || "Conversation"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">
                      {selectedConversation ? `@${selectedConversation.username}` : "Conversation"}
                    </h4>
                    <p className="text-white/50 text-sm">Aucun message pour le moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start gap-3 px-4 py-2 rounded hover:bg-white/5 transition-colors group"
                      >
                      <button
                        type="button"
                        onClick={() => setSelectedPublicUserId(message.author_id)}
                        className="flex-shrink-0"
                      >
                        <SmartImg
                          src={getAvatar(message.author_id, currentUser)}
                          alt={message.username}
                          className="w-10 h-10 rounded-full object-cover border border-[#4fdfff]/30 group-hover:border-[#4fdfff]/50 transition-colors"
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <button
                            type="button"
                            onClick={() => setSelectedPublicUserId(message.author_id)}
                            className="font-semibold text-white hover:text-[#4fdfff] transition-colors cursor-pointer"
                          >
                            {message.username}
                          </button>
                          <span className="text-xs text-white/40">
                            {new Date(message.created_at).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {message.edited_at && (
                              <span className="ml-1 text-[10px] text-white/20 italic">{t("chat.edited")}</span>
                            )}
                          </span>
                        </div>
                        {isGifMessage(message.content) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={message.content}
                            alt="GIF"
                            className="max-w-xs max-h-48 rounded-lg mt-1"
                            loading="lazy"
                          />
                        ) : (
                          <p className="text-white/90 leading-relaxed break-all whitespace-pre-wrap">
                            {message.content}
                          </p>
                        )}

                        <MessageReactions
                          messageId={message.id}
                          reactions={message.reactions ?? []}
                          viewerId={currentUser?.id}
                          onToggleReaction={toggleDirectReaction}
                          addReactionLabel={t("chat.addReaction")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
              <div className="relative px-4 py-3 border-t border-[#4fdfff]/20 bg-[rgba(0,0,0,0.2)]">
                {showGifPicker && (
                  <GifPicker
                    onSelect={handleSendGif}
                    onClose={() => setShowGifPicker(false)}
                    searchPlaceholder={t("chat.gifSearch")}
                  />
                )}
                <form onSubmit={handleSendDirectMessage} className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGifPicker((prev) => !prev)}
                    className="px-2 py-2 text-xs font-bold text-[#4fdfff] border border-[#4fdfff]/40 rounded-lg hover:bg-[#4fdfff]/10 transition-colors flex-shrink-0"
                    title={t("chat.gifTooltip")}
                  >
                    GIF
                  </button>
                  <input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={selectedConversation ? `Message @${selectedConversation.username}` : "Message"}
                    className="flex-1 px-4 py-2.5 bg-[rgba(20,20,20,0.8)] border border-[#4fdfff]/30 rounded-lg text-white placeholder:text-white/40 outline-none focus:border-[#4fdfff] focus:bg-[rgba(20,20,20,0.95)] focus:shadow-[0_0_8px_rgba(79,223,255,0.3)] transition-all"
                  />
                  <Button type="submit" className="bg-[#4fdfff] text-black">
                    Envoyer
                  </Button>
                </form>
              </div>
           </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-24 h-24 rounded-full bg-[#4fdfff]/10 border-2 border-[#4fdfff]/30 flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-[#4fdfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Tes Messages Privés</h2>
            <p className="text-white/50 max-w-sm">Lance une nouvelle discussion avec un habitant de Night City en cliquant sur le +.</p>
            <Button onClick={() => setShowNewChatModal(true)} variant="outline" className="mt-6 border-[#4fdfff] text-[#4fdfff]">
                Démarrer une conversation
            </Button>
          </div>
        )}
      </div>

      {/* ========== MODAL NOUVELLE CONVERSATION ========== */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={resetNewConversationModal} />
          <form onSubmit={handleStartConversation} className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#4fdfff] rounded-xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(79,223,255,0.2)]">
            <h2 className="text-xl font-bold text-white mb-4">Nouvelle conversation</h2>
            <p className="text-white/60 text-sm mb-4">Recherche ton contact puis sélectionne un pseudo fiable pour démarrer la conversation.</p>
            
            <input
              autoFocus
              type="text"
              value={searchUsername}
              onChange={(e) => {
                setSearchUsername(e.target.value);
                setModalError(null);
              }}
              placeholder="Pseudo (ex: CyberGhost)"
              className="w-full bg-black/50 border border-[#4fdfff]/30 rounded-lg p-3 text-white outline-none focus:border-[#4fdfff]"
            />

            {modalError && (
              <p className="mt-3 text-sm text-[#ff3333]">{modalError}</p>
            )}

            <div className="mt-3 mb-6 rounded-lg border border-[#4fdfff]/20 bg-black/30 overflow-hidden">
              {searchLoading && (
                <p className="px-3 py-3 text-sm text-white/50">Recherche en cours...</p>
              )}

              {!searchLoading && searchUsername.trim() && searchResults.length === 0 && (
                <p className="px-3 py-3 text-sm text-white/40">Aucun utilisateur correspondant.</p>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((user) => {
                    const isSelected = searchUsername.trim() === user.username;

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSearchUsername(user.username);
                          setModalError(null);
                        }}
                        className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors ${
                          isSelected ? "bg-[#4fdfff]/15 text-white" : "text-white/75 hover:bg-white/5"
                        }`}
                      >
                        <SmartImg
                          src={getAvatar(user.id, null)}
                          alt={user.username}
                          className="h-10 w-10 rounded-full border border-[#4fdfff]/30"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{user.username}</p>
                          <p className="truncate text-[11px] uppercase text-white/35">
                            {t(getStatusKey(user.status))}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={resetNewConversationModal} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-[#4fdfff] text-black" disabled={!searchUsername.trim() || searchLoading}>
                Lancer
              </Button>
            </div>
          </form>
        </div>
      )}

      {selectedPublicUserId && (
        <PublicProfileCard
          userId={selectedPublicUserId}
          onClose={() => setSelectedPublicUserId(null)}
        />
      )}
    </main>
  );
}

export default function DirectMessagesPage() {
  return (
    <Suspense fallback={<main className="flex w-full h-screen bg-[rgba(10,15,20,0.98)]" />}>
      <DirectMessagesPageContent />
    </Suspense>
  );
}
