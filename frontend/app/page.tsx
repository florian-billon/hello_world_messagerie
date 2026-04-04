"use client";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { logout } from "@/lib/auth/actions";
import { useServers, useChannels, useMessages, useMembers, useAuth } from "@/hooks";
import ProfileCard from "@/components/ProfileCard";
import InviteModal from "@/modals/InviteModal";
import { User } from "@/lib/api-server";
import { getAvatar, normalizeAvatarUrl } from "@/lib/avatar";
import { getStatusColor, getStatusKey, normalizeStatus } from "@/lib/presence";
import { useTranslation } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import SmartImg from "@/components/SmartImg";
import MessageReactions from "@/components/chat/MessageReactions";

/**
 * Page principale - Design Moderne Cyberpunk
 * Layout: SERVER SIDEBAR (72px) | CHANNEL SIDEBAR (240px) | CHAT CENTER | MEMBERS SIDEBAR (240px)
 */
export default function Home() {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const {
    servers,
    selectedServer,
    selectServer,
    createServer,
    creatingServer,
    leaveServer,
    deleteServer,
    transferOwnership,
    loading: serversLoading,
    error: serversError,
  } = useServers();

  const { channels, selectedChannel, selectChannel, createChannel, deleteChannel, loading: channelsLoading, error: channelsError } = useChannels(
    selectedServer?.id ?? null
  );

  const {
    messages,
    sendMessage,
    updateMessage,
    deleteMessage,
    toggleReaction,
    loading: messagesLoading,
    error: messagesError,
    typingUsers,
    typingStart,
    typingStop,
  } = useMessages(selectedChannel?.id ?? null, user?.id ?? null);
  const { members, kickMember, banMember } = useMembers(selectedServer?.id ?? null);

  const [showCreateServer, setShowCreateServer] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showDeleteMessageConfirm, setShowDeleteMessageConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [showDeleteChannelConfirm, setShowDeleteChannelConfirm] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<{ id: string; name: string } | null>(null);
  const [newOwnerIdForLeave, setNewOwnerIdForLeave] = useState("");
  const [leaveModalError, setLeaveModalError] = useState<string | null>(null);
  const typingStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const TYPING_STOP_DELAY_MS = 2000;
  const viewerId = (currentUser || user)?.id;
  const isServerOwner = selectedServer?.owner_id === viewerId;
  const transferCandidates = members.filter((member) => member.user_id !== viewerId);
  const viewerRole = members.find((member) => member.user_id === viewerId)?.role;
  const canManageChannels = viewerRole === "Owner" || viewerRole === "Admin";

  if (user && !currentUser) {
    setCurrentUser(user as User);
  }

  const scheduleTypingStop = useCallback(() => {
    if (typingStopTimeoutRef.current) clearTimeout(typingStopTimeoutRef.current);
    if (!selectedChannel?.id) return;
    typingStopTimeoutRef.current = setTimeout(() => {
      typingStop(selectedChannel.id);
      typingStopTimeoutRef.current = null;
    }, TYPING_STOP_DELAY_MS);
  }, [selectedChannel?.id, typingStop]);

  const handleInputFocus = useCallback(() => {
    if (selectedChannel?.id) typingStart(selectedChannel.id);
  }, [selectedChannel?.id, typingStart]);

  const handleInputBlur = useCallback(() => {
    if (typingStopTimeoutRef.current) {
      clearTimeout(typingStopTimeoutRef.current);
      typingStopTimeoutRef.current = null;
    }
    if (selectedChannel?.id) typingStop(selectedChannel.id);
  }, [selectedChannel?.id, typingStop]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessageInput(e.target.value);
      scheduleTypingStop();
    },
    [scheduleTypingStop]
  );

  // Style des boutons action (rouge + bordure cyan)

  // Handlers
  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;
    const server = await createServer(newServerName.trim());
    if (server) {
      setNewServerName("");
      setShowCreateServer(false);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    await createChannel(newChannelName.trim());
    setNewChannelName("");
    setShowCreateChannel(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    if (selectedChannel?.id) typingStop(selectedChannel.id);
    await sendMessage(messageInput.trim());
    setMessageInput("");
  };

  const handleStartEdit = (message: any) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessageId || !editContent.trim()) return;
    await updateMessage(editingMessageId, editContent.trim());
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleDeleteMessage = (id: string) => {
    setMessageToDelete(id);
    setShowDeleteMessageConfirm(true);
  };

  const handleDeleteChannel = (id: string, name: string) => {
    setChannelToDelete({ id, name });
    setShowDeleteChannelConfirm(true);
  };

  const confirmDeleteChannel = async () => {
    if (!channelToDelete) return;
    await deleteChannel(channelToDelete.id);
    setShowDeleteChannelConfirm(false);
    setChannelToDelete(null);
  };

  const confirmDeleteMessage = async () => {
    if (messageToDelete) {
      await deleteMessage(messageToDelete);
    }
    setShowDeleteMessageConfirm(false);
    setMessageToDelete(null);
  };

  if (serversLoading) {
    return (
      <main className="flex w-full h-screen gap-2 p-2 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[#4fdfff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#4fdfff] font-mono text-sm tracking-widest animate-pulse">
            {t("chat.initializing")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex w-full h-screen">

      {/* ========== SERVER SIDEBAR (72px) - Compacte avec icônes circulaires ========== */}
      <aside className="w-[72px] bg-[rgba(0,0,0,0.95)] border-r border-[#4fdfff]/20 flex flex-col items-center py-3 gap-2">
        {/* Logo */}
        <button
          onClick={() => selectServer(null)}
          className="w-12 h-12 rounded-2xl bg-[#4fdfff]/10 border border-[#4fdfff]/50 flex items-center justify-center mb-2 hover:rounded-xl hover:bg-[#4fdfff]/20 transition-all cursor-pointer group"
          title={t("common.appName")}
        >
          <Image
            src="/logo.png"
            alt="HW"
            width={32}
            height={32}
            className="group-hover:scale-110 transition-transform"
          />
        </button>

        <div className="w-8 h-[2px] bg-[#4fdfff]/20 rounded-full" />

        {/* Server list */}
        <div className="flex-1 w-full overflow-y-auto flex flex-col items-center gap-2 py-2">
          {servers.map((server) => (
            <button
              key={server.id}
              onClick={() => selectServer(server)}
              className={`w-12 h-12 rounded-[24px] flex items-center justify-center text-lg font-bold transition-all duration-200 relative group ${selectedServer?.id === server.id
                ? "bg-[#4fdfff] text-black rounded-xl shadow-[0_0_12px_rgba(79,223,255,0.6)]"
                : "bg-[rgba(20,30,40,0.8)] text-[#4fdfff] hover:bg-[#4fdfff]/20 hover:rounded-xl"
                }`}
              title={server.name}
            >
              {server.name.charAt(0).toUpperCase()}
              {/* Indicator bar */}
              <span
                className={`absolute left-0 w-1 bg-[#4fdfff] rounded-r transition-all ${selectedServer?.id === server.id ? "h-10" : "h-0 group-hover:h-5"
                  }`}
              />
            </button>
          ))}
        </div>

        {/* Add server button */}
        <button
          onClick={() => setShowCreateServer(true)}
          className="w-12 h-12 rounded-[24px] bg-[rgba(20,30,40,0.8)] border border-dashed border-[#4fdfff]/30 flex items-center justify-center text-[#4fdfff] hover:bg-[#4fdfff]/10 hover:border-[#4fdfff] hover:rounded-xl transition-all group"
          title={t("server.createTooltip")}
        >
          <span className="text-2xl group-hover:rotate-90 transition-transform">+</span>
        </button>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="w-12 h-12 rounded-[24px] bg-[rgba(40,10,10,0.8)] flex items-center justify-center text-[#ff3333] hover:bg-[#ff3333]/20 hover:rounded-xl transition-all mt-2"
          title={t("auth.logout")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </aside>

      {/* ========== CHANNEL SIDEBAR (240px) ========== */}
      <aside className="w-60 bg-[rgba(5,10,15,0.95)] border-r border-[#4fdfff]/20 flex flex-col">
        {selectedServer ? (
          <>
            {/* Server header avec dropdown */}
            <div className="relative h-12 px-4 flex items-center border-b border-[#4fdfff]/30 shadow-lg bg-[rgba(0,0,0,0.3)]">
              <h2 className="font-bold text-white truncate flex-1">{selectedServer.name}</h2>
              <button
                type="button"
                onClick={() => setShowServerMenu((v) => !v)}
                className="text-[#4fdfff] text-xs font-mono hover:text-white transition-colors px-1"
                title={t("server.options")}
              >
                ▼
              </button>
              {showServerMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowServerMenu(false)} />
                  <div className="absolute top-12 right-2 z-50 bg-[rgba(15,20,25,0.98)] border border-[#4fdfff]/30 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.8)] py-1 min-w-[180px]">
                    {!isServerOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowServerMenu(false);
                          setLeaveModalError(null);
                          setNewOwnerIdForLeave("");
                          setShowLeaveConfirm(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-[#ff3333] hover:bg-[#ff3333]/10 transition-colors"
                      >
                        {t("server.leave")}
                      </button>
                    )}
                    {isServerOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowServerMenu(false);
                          setLeaveModalError(null);
                          setNewOwnerIdForLeave(transferCandidates[0]?.user_id || "");
                          setShowLeaveConfirm(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-[#ff3333] hover:bg-[#ff3333]/10 transition-colors"
                      >
                        {t("server.leave")}
                      </button>
                    )}
                    {isServerOwner && (
                      <button
                        type="button"
                        onClick={() => { setShowServerMenu(false); setShowDeleteConfirm(true); }}
                        className="w-full text-left px-4 py-2 text-sm text-[#ff3333]/70 hover:bg-[#ff3333]/10 transition-colors"
                      >
                        {t("server.delete")}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Channels */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">
                  {t("channel.textChannels")}
                </span>
                <button
                  onClick={() => setShowCreateChannel(true)}
                  className="text-white/50 hover:text-[#4fdfff] transition-colors text-lg font-bold"
                  title={t("channel.createTooltip")}
                >
                  +
                </button>
              </div>

              <div className="space-y-[2px]">
                {channelsLoading ? (
                  <div className="px-2 py-2 text-white/40 text-sm">{t("common.loading")}</div>
                ) : channelsError ? (
                  <div className="px-2 py-2 text-[#ff3333] text-sm">{channelsError}</div>
                ) : channels.length === 0 ? (
                  <div className="px-2 py-2 text-white/40 text-sm italic">{t("chat.noChannel")}</div>
                ) : (
                  channels.map((channel) => (
                    <div
                      key={channel.id}
                      className={`group w-full flex items-center rounded transition-colors ${selectedChannel?.id === channel.id
                        ? "bg-[#4fdfff]/15"
                        : "hover:bg-white/5"
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => selectChannel(channel)}
                        className={`flex-1 text-left px-2 py-1.5 flex items-center gap-2 ${selectedChannel?.id === channel.id
                          ? "text-white"
                          : "text-white/60 group-hover:text-white"
                          }`}
                      >
                        <span className="text-white/40">#</span>
                        <span className="truncate text-sm">{channel.name}</span>
                      </button>
                      {canManageChannels && (
                        <button
                          type="button"
                          onClick={() => handleDeleteChannel(channel.id, channel.name)}
                          className="opacity-0 group-hover:opacity-100 pr-2 text-white/30 hover:text-[#ff3333] transition-all"
                          title={t("channel.deleteTooltip")}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-white/20 text-xs text-center px-4 italic">
              {t("chat.selectServerForChannels")}
            </p>
          </div>
        )}

        {/* User info footer (Toujours visible) */}
        <div className="h-14 px-2 flex items-center gap-2 bg-[rgba(0,0,0,0.5)] border-t border-[#4fdfff]/20">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 flex-1 min-w-0 hover:bg-white/5 rounded p-1 transition-colors"
          >
            <div className="relative flex-shrink-0">
              {(currentUser || user)?.avatar_url ? (
                <SmartImg
                  src={normalizeAvatarUrl((currentUser || user)?.avatar_url) || ''}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border border-[#4fdfff]/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#4fdfff]/20 border border-[#4fdfff]/50 flex items-center justify-center">
                  <span className="text-[#4fdfff] text-xs font-bold">
                    {(currentUser || user)?.username?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[rgba(5,10,15,0.95)] rounded-full ${getStatusColor((currentUser || user)?.status)}`} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{(currentUser || user)?.username || t("chat.guest")}</p>
              <p className="text-[10px] text-[#4fdfff] font-mono uppercase">
                {t(getStatusKey((currentUser || user)?.status))}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* ========== CHAT CENTER ========== */}
      <div className="flex-1 flex flex-col bg-[rgba(10,15,20,0.98)]">
        {/* Header */}
        <header className="h-12 px-4 flex items-center border-b border-[#4fdfff]/20 bg-[rgba(0,0,0,0.3)] shadow-sm">
          <h1 className="text-white font-semibold text-sm flex items-center gap-2">
            {selectedChannel ? (
              <>
                <span className="text-white/40">#</span>
                <span>{selectedChannel.name}</span>
              </>
            ) : selectedServer ? (
              <>
                <span className="text-[#4fdfff]">{selectedServer.name}</span>
                <span className="text-white/40 text-xs font-normal">- {t("chat.selectChannel")}</span>
              </>
            ) : (
              <>
                <span className="text-[#4fdfff]">{t("common.appName")}</span>
                <span className="text-white/40 text-xs font-normal">- {t("chat.selectServer")}</span>
              </>
            )}
          </h1>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedChannel ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-[#4fdfff]/10 border-2 border-[#4fdfff]/30 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-5xl text-[#4fdfff]">#</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedServer ? t("chat.selectChannel") : t("chat.selectServer")}
                </h2>
                <p className="text-white/50 text-sm">
                  {selectedServer ? t("chat.selectChannelPrompt") : t("chat.selectServerPrompt")}
                </p>
              </div>
            </div>
          ) : messagesLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#4fdfff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[#4fdfff] text-sm">{t("chat.loadingMessages")}</p>
              </div>
            </div>
          ) : messagesError ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-[#ff3333]">{messagesError}</p>
            </div>
          ) : Array.isArray(messages) && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 px-4 py-2 rounded hover:bg-white/5 transition-colors group">
                  <SmartImg
                    src={getAvatar(msg.author_id, currentUser || user)}
                    alt={msg.username}
                    className="w-10 h-10 rounded-full object-cover border border-[#4fdfff]/30 flex-shrink-0 group-hover:border-[#4fdfff]/50 transition-colors"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-white hover:text-[#4fdfff] transition-colors cursor-pointer">
                        {msg.username}
                      </span>
                      <span className="text-xs text-white/40">
                        {new Date(msg.created_at).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {msg.edited_at && <span className="ml-1 text-[10px] text-white/20 italic">{t("chat.edited")}</span>}
                      </span>
                    </div>
                    {editingMessageId === msg.id ? (
                      <form onSubmit={handleSaveEdit} className="mt-1">
                        <input
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => e.key === "Escape" && setEditingMessageId(null)}
                          className="w-full px-3 py-1.5 bg-black/50 border border-[#4fdfff]/50 rounded text-white text-sm outline-none focus:border-[#4fdfff]"
                        />
                        <div className="flex gap-2 mt-2">
                          <button type="submit" className="text-[10px] text-[#4fdfff] hover:underline font-bold uppercase">{t("chat.save")}</button>
                          <button type="button" onClick={() => setEditingMessageId(null)} className="text-[10px] text-white/40 hover:underline font-bold uppercase">{t("common.cancel")}</button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-white/90 leading-relaxed break-words">
                        {msg.content}
                      </p>
                    )}

                    {!editingMessageId && (
                      <MessageReactions
                        messageId={msg.id}
                        reactions={msg.reactions ?? []}
                        onToggleReaction={toggleReaction}
                        addReactionLabel={t("chat.addReaction")}
                      />
                    )}
                  </div>

                  {/* Actions au survol */}
                  {!editingMessageId && msg.author_id === user?.id && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all ml-auto self-start">
                      <button
                        onClick={() => handleStartEdit(msg)}
                        className="p-1.5 text-white/40 hover:text-[#4fdfff] transition-colors"
                        title={t("chat.edit")}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 text-white/40 hover:text-[#ff3333] transition-colors"
                        title={t("chat.delete")}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-full bg-[#4fdfff]/10 border-2 border-[#4fdfff]/30 flex items-center justify-center mb-4">
                <span className="text-4xl text-[#4fdfff]">#</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">
                {t("chat.welcomeChannel", { channelName: selectedChannel.name })}
              </h4>
              <p className="text-white/50 text-sm">
                {t("chat.channelStart")}
              </p>
            </div>
          )}
        </div>

        {/* Message input */}
        {selectedChannel && (
          <footer className="px-4 py-3 border-t border-[#4fdfff]/20 bg-[rgba(0,0,0,0.2)]">
            {/* Typing indicator above input */}
            {typingUsers.size > 0 && (() => {
              const entries = Array.from(typingUsers.entries()).filter(([id]) => id !== user?.id);
              if (entries.length === 0) return null;
              const names = entries.map(([, name]) => name).join(", ");
              const label = entries.length === 1 ? `${names} est en train d'écrire` : `${names} sont en train d'écrire`;
              return (
                <div className="flex items-center gap-2 px-2 pb-1 text-sm text-white/60">
                  <div className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-[#4fdfff] rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-[#4fdfff] rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-[#4fdfff] rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span>{t(entries.length === 1 ? "chat.typing" : "chat.typingPlural", { names })}</span>
                </div>
              );
            })()}
            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={t("chat.messagePlaceholder", { channelName: selectedChannel.name })}
                className="w-full px-4 py-2.5 bg-[rgba(20,20,20,0.8)] border border-[#4fdfff]/30 rounded-lg text-white placeholder:text-white/40 outline-none focus:border-[#4fdfff] focus:bg-[rgba(20,20,20,0.95)] focus:shadow-[0_0_8px_rgba(79,223,255,0.3)] transition-all"
              />
            </form>
          </footer>
        )}
      </div>

      {/* ========== MEMBERS SIDEBAR (240px) ========== */}
      {selectedServer ? (
        <aside className="w-60 bg-[rgba(5,10,15,0.95)] border-l border-[#4fdfff]/20 flex flex-col">
          {/* Header */}
          <div className="h-12 px-4 flex items-center justify-between border-b border-[#4fdfff]/20 bg-[rgba(0,0,0,0.3)]">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">
              {t("members.title", { count: members.length })}
            </h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-[#4fdfff] hover:text-white text-lg font-bold"
              title={t("members.inviteTooltip")}
            >
              +
            </button>
          </div>

          {/* Members list */}
          <div className="flex-1 overflow-y-auto p-2">
            {members.length === 0 ? (
              <p className="text-sm text-white/40 italic px-2">{t("members.noMembers")}</p>
            ) : (
              <>
                {/* Owners */}
                {members.filter((m) => m.role === "Owner").length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] text-[#ff3333] font-bold mb-2 px-2 tracking-wider uppercase">
                      {t("members.owner")}
                    </p>
                    {members
                      .filter((m) => m.role === "Owner")
                      .map((member) => {
                        const isTypingOwner = selectedChannel?.id && typingUsers.has(member.user_id);
                        return (
                          <div
                            key={member.user_id}
                            className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
                          >
                            <div className="relative">
                              <SmartImg
                                src={getAvatar(member.user_id, currentUser || user)}
                                alt="Owner"
                                className="w-8 h-8 rounded-full object-cover border border-[#ff3333]/50"
                              />
                              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[rgba(5,10,15,0.95)] rounded-full ${getStatusColor(member.status)}`} />
                            </div>
                            <span className="text-sm text-white/90 truncate flex-1">
                              {member.username}
                            </span>
                            {isTypingOwner && (
                              <div className="flex gap-0.5 flex-shrink-0" title={t("chat.isTyping")}>
                                <span className="w-1 h-1 bg-[#4fdfff] rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="w-1 h-1 bg-[#4fdfff] rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="w-1 h-1 bg-[#4fdfff] rounded-full animate-bounce [animation-delay:300ms]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Regular members */}
                {members.filter((m) => m.role !== "Owner").length > 0 && (
                  <div>
                    <p className="text-[10px] text-white/50 font-bold mb-2 px-2 tracking-wider uppercase">
                      {t("members.members")}
                    </p>
                    {(() => {
                      const myRole = members.find((m) => m.user_id === (user?.id))?.role;
                      const canKick = myRole === "Owner" || myRole === "Admin";
                      return members
                        .filter((m) => m.role !== "Owner")
                        .map((member) => {
                          const isMe = member.user_id === user?.id;
                          const kickable = canKick && !isMe && !(myRole === "Admin" && member.role === "Admin");
                          const bannable = kickable; // mêmes règles que kick pour cette version
                          const isTyping = selectedChannel?.id && typingUsers.has(member.user_id);
                          return (
                            <div
                              key={member.user_id}
                              className="group flex items-center gap-2 py-1.5 px-2 rounded hover:bg-white/5 transition-colors"
                            >
                              <div className="relative flex-shrink-0">
                                <SmartImg
                                  src={getAvatar(member.user_id, currentUser || user)}
                                  alt="Member"
                                  className="w-8 h-8 rounded-full object-cover border border-[#4fdfff]/30"
                                />
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[rgba(5,10,15,0.95)] rounded-full ${getStatusColor(member.status)}`} />
                              </div>
                              <span className="text-sm text-white/70 truncate flex-1">
                                {member.username}
                              </span>
                              {isTyping && (
                                <div className="flex gap-0.5 flex-shrink-0" title={t("chat.isTyping")}>
                                  <span className="w-1 h-1 bg-[#4fdfff] rounded-full animate-bounce [animation-delay:0ms]" />
                                  <span className="w-1 h-1 bg-[#4fdfff] rounded-full animate-bounce [animation-delay:150ms]" />
                                  <span className="w-1 h-1 bg-[#4fdfff] rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                              )}
                              {kickable && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => kickMember(member.user_id)}
                                    className="text-white/30 hover:text-[#ff3333] transition-colors"
                                    title={t("members.kick", { username: member.username })}
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6m3-3l3 3-3 3" />
                                    </svg>
                                  </button>
                                  {bannable && (
                                    <button
                                      type="button"
                                      onClick={() => banMember(member.user_id)}
                                      className="text-white/30 hover:text-[#ff3333] transition-colors"
                                      title={t("members.ban", { username: member.username })}
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M6.343 6.343l11.314 11.314" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        });
                    })()}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      ) : (
        <aside className="w-60 bg-[rgba(5,10,15,0.95)] border-l border-[#4fdfff]/20 flex flex-col items-center justify-center">
          <p className="text-white/40 text-sm text-center px-4">{t("chat.selectServer")}</p>
        </aside>
      )}

      {/* ========== MODAL CREATE SERVER ========== */}
      {showCreateServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateServer(false)} />
          <div className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#4fdfff] rounded-xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(79,223,255,0.3)]">
            <h2 className="text-xl font-bold text-center text-white mb-1">{t("server.createTitle")}</h2>
            <p className="text-center text-white/50 text-sm mb-6">
              {t("server.createDescription")}
            </p>
            {serversError && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {serversError}
              </div>
            )}
            <form onSubmit={handleCreateServer}>
              <label className="block text-[10px] font-bold text-[#4fdfff] tracking-widest uppercase mb-2">
                {t("server.nameLabel")}
              </label>
              <input
                type="text"
                value={newServerName}
                onChange={(e) => setNewServerName(e.target.value)}
                placeholder={t("server.namePlaceholder")}
                autoFocus
                className="w-full px-4 py-3 bg-black/50 border-2 border-[#4fdfff]/50 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#4fdfff] focus:shadow-[0_0_10px_rgba(79,223,255,0.3)] mb-6 transition-all"
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  disabled={creatingServer}
                  onClick={() => setShowCreateServer(false)}
                  className="flex-1"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={creatingServer}
                  disabled={creatingServer || !newServerName.trim()}
                  className="flex-1 uppercase"
                >
                  {t("common.create")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== MODAL CREATE CHANNEL ========== */}
      {showCreateChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateChannel(false)} />
          <div className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#4fdfff] rounded-xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(79,223,255,0.3)]">
            <h2 className="text-xl font-bold text-center text-white mb-1">{t("channel.createTitle")}</h2>
            <p className="text-center text-white/50 text-sm mb-6">
              {t("channel.createDescription", { serverName: selectedServer?.name || "" })}
            </p>
            <form onSubmit={handleCreateChannel}>
              <label className="block text-[10px] font-bold text-[#4fdfff] tracking-widest uppercase mb-2">
                {t("channel.nameLabel")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">#</span>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="general"
                  autoFocus
                  className="w-full pl-8 pr-4 py-3 bg-black/50 border-2 border-[#4fdfff]/50 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#4fdfff] focus:shadow-[0_0_10px_rgba(79,223,255,0.3)] mb-6 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateChannel(false)}
                  className="flex-1 py-2.5 text-white/60 hover:text-white hover:underline transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!newChannelName.trim()}
                  className="flex-1 uppercase"
                >
                  {t("common.create")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== MODAL PROFILE CARD ========== */}
      {showProfile && (currentUser || user) && (
        <ProfileCard
          user={(currentUser || user) as User}
          onClose={() => setShowProfile(false)}
          onUpdate={(updatedUser) => setCurrentUser(updatedUser)}
        />
      )}

      {/* ========== MODAL INVITE ========== */}
      {showInviteModal && selectedServer && (
        <InviteModal
          serverId={selectedServer.id}
          serverName={selectedServer.name}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {/* ========== MODAL DELETE SERVER ========== */}
      {showDeleteConfirm && selectedServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#ff3333] rounded-xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(255,51,51,0.3)]">
            <h2 className="text-xl font-bold text-center text-white mb-2">{t("server.confirmDelete.title")}</h2>
            <p className="text-center text-white/60 text-sm mb-6">
              {t("server.confirmDelete.message", { serverName: selectedServer.name })}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={async () => {
                  if (!isServerOwner) return;
                  setShowDeleteConfirm(false);
                  await deleteServer(selectedServer.id);
                }}
                className="flex-1"
              >
                {t("common.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL LEAVE SERVER ========== */}
      {showLeaveConfirm && selectedServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLeaveConfirm(false)} />
          <div className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#ff3333] rounded-xl p-6 w-full max-sm shadow-[0_0_40px_rgba(255,51,51,0.3)]">
            <h2 className="text-xl font-bold text-center text-white mb-2">{t("server.confirmLeave.title")}</h2>
            <p className="text-center text-white/60 text-sm mb-6">
              {t("server.confirmLeave.message", { serverName: selectedServer.name })}
            </p>
            {isServerOwner && (
              <div className="mb-4">
                <label htmlFor="new-owner" className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">
                  {t("server.confirmLeave.transferLabel")}
                </label>
                <select
                  id="new-owner"
                  value={newOwnerIdForLeave}
                  onChange={(e) => {
                    setNewOwnerIdForLeave(e.target.value);
                    setLeaveModalError(null);
                  }}
                  className="w-full px-3 py-2 bg-[rgba(20,20,20,0.8)] border border-[#4fdfff]/30 rounded-lg text-white text-sm focus:outline-none focus:border-[#4fdfff] focus:shadow-[0_0_8px_rgba(79,223,255,0.3)] transition-all"
                >
                  <option value="">{t("server.confirmLeave.transferPlaceholder")}</option>
                  {transferCandidates.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {leaveModalError && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {leaveModalError}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setShowLeaveConfirm(false);
                  setLeaveModalError(null);
                }}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={async () => {
                  if (isServerOwner) {
                    if (transferCandidates.length === 0) {
                      setLeaveModalError(t("server.confirmLeave.noCandidates"));
                      return;
                    }
                    if (!newOwnerIdForLeave) {
                      setLeaveModalError(t("server.confirmLeave.transferRequired"));
                      return;
                    }

                    const transferred = await transferOwnership(selectedServer.id, newOwnerIdForLeave);
                    if (!transferred) {
                      setLeaveModalError(serversError || t("error.default"));
                      return;
                    }

                    const left = await leaveServer(selectedServer.id);
                    if (!left) {
                      setLeaveModalError(serversError || t("error.default"));
                      return;
                    }

                    setShowLeaveConfirm(false);
                    setLeaveModalError(null);
                    return;
                  }

                  const left = await leaveServer(selectedServer.id);
                  if (!left) {
                    setLeaveModalError(serversError || t("error.default"));
                    return;
                  }

                  setShowLeaveConfirm(false);
                  setLeaveModalError(null);
                }}
                className="flex-1"
              >
                {t("server.leave")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL DELETE CHANNEL ========== */}
      {showDeleteChannelConfirm && channelToDelete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => {
            setShowDeleteChannelConfirm(false);
            setChannelToDelete(null);
          }} />
          <div className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#ff3333] rounded-xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(255,51,51,0.3)]">
            <h2 className="text-xl font-bold text-center text-white mb-2">{t("channel.confirmDeleteTitle")}</h2>
            <p className="text-center text-white/60 text-sm mb-6">
              {t("channel.confirmDeleteMessage", { channelName: channelToDelete.name })}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setShowDeleteChannelConfirm(false);
                  setChannelToDelete(null);
                }}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={confirmDeleteChannel}
                className="flex-1"
              >
                {t("chat.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL DELETE MESSAGE ========== */}
      {showDeleteMessageConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteMessageConfirm(false)} />
          <div className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#ff3333] rounded-xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(255,51,51,0.3)]">
            <h2 className="text-xl font-bold text-center text-white mb-2">{t("chat.confirmDeleteTitle")}</h2>
            <p className="text-center text-white/60 text-sm mb-6">
              {t("chat.confirmDeleteMessage")}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowDeleteMessageConfirm(false)}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={confirmDeleteMessage}
                className="flex-1"
              >
                {t("chat.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
