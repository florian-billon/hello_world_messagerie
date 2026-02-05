"use client";
import { useState } from "react";
import Image from "next/image";
import { logout } from "@/lib/auth/actions";
import { useServers, useChannels, useMessages, useMembers, useAuth} from "@/hooks";

/**
 * Page principale - Layout Discord + Design Hacker Cyber
 */
export default function Home() {
  const { user } = useAuth()
  const {
    servers,
    selectedServer,
    selectServer,
    createServer,
    loading: serversLoading,
    error: serversError,
  } = useServers();

  const { channels, selectedChannel, selectChannel, createChannel, loading: channelsLoading, error: channelsError } = useChannels(
    selectedServer?.id ?? null
  );

  const { messages, sendMessage, loading: messagesLoading, error: messagesError } = useMessages(selectedChannel?.id ?? null);
  const { members } = useMembers(selectedServer?.id ?? null);

  const [showCreateServer, setShowCreateServer] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [messageInput, setMessageInput] = useState("");

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
  
  // On ne passe QUE le nom. L'ID du serveur est déjà lié au hook.
  await createChannel(newChannelName.trim()); 
  
  setNewChannelName("");
  setShowCreateChannel(false);
};

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    await sendMessage(messageInput.trim());
    setMessageInput("");
  };

  if (serversLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-accent)] font-mono text-sm tracking-widest">
            INITIALIZING...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full">
      {/* ========== SERVER SIDEBAR (Discord style) ========== */}
      <aside className="w-[72px] bg-[rgba(0,0,0,0.9)] border-r border-[var(--color-border-dim)] flex flex-col items-center py-3 gap-2">
        {/* Logo */}
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)] flex items-center justify-center mb-2 hover:rounded-xl transition-all cursor-pointer group">
          <Image
            src="/logo.png"
            alt="HW"
            width={32}
            height={32}
            className="group-hover:scale-110 transition-transform"
          />
        </div>

        <div className="w-8 h-[2px] bg-[var(--color-border-dim)] rounded-full" />

        {/* Server list */}
        <div className="flex-1 w-full overflow-y-auto flex flex-col items-center gap-2 py-2">
          {servers.map((server) => (
            <button
              key={server.id}
              onClick={() => selectServer(server)}
              className={`w-12 h-12 rounded-[24px] flex items-center justify-center text-lg font-bold transition-all duration-200 relative group ${
                selectedServer?.id === server.id
                  ? "bg-[var(--color-accent)] text-black rounded-xl"
                  : "bg-[rgba(20,30,40,0.8)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 hover:rounded-xl"
              }`}
              title={server.name}
            >
              {server.name.charAt(0).toUpperCase()}
              {/* Indicator */}
              <span
                className={`absolute left-0 w-1 bg-[var(--color-accent)] rounded-r transition-all ${
                  selectedServer?.id === server.id ? "h-10" : "h-0 group-hover:h-5"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Add server button */}
        <button
          onClick={() => setShowCreateServer(true)}
          className="w-12 h-12 rounded-[24px] bg-[rgba(20,30,40,0.8)] border border-dashed border-[var(--color-border-dim)] flex items-center justify-center text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 hover:border-[var(--color-accent)] hover:rounded-xl transition-all group"
          title="Creer un serveur"
        >
          <span className="text-2xl group-hover:rotate-90 transition-transform">+</span>
        </button>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="w-12 h-12 rounded-[24px] bg-[rgba(40,10,10,0.8)] flex items-center justify-center text-[var(--color-accent-red)] hover:bg-[var(--color-accent-red)]/20 hover:rounded-xl transition-all mt-2"
          title="Deconnexion"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </aside>

      {/* ========== CHANNEL SIDEBAR ========== */}
      {selectedServer ? (
        <aside className="w-60 bg-[rgba(5,10,15,0.95)] border-r border-[var(--color-border-dim)] flex flex-col">
          {/* Server header */}
          <div className="h-12 px-4 flex items-center border-b border-[var(--color-border)] shadow-lg">
            <h2 className="font-bold text-white truncate flex-1">{selectedServer.name}</h2>
            <span className="text-[var(--color-accent)] text-xs font-mono">▼</span>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase">
                CHANNELS TEXTUELS
              </span>
              <button
                onClick={() => setShowCreateChannel(true)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                title="Creer un channel"
              >
                +
              </button>
            </div>

            <div className="space-y-[2px]">
              {channelsLoading ? (
                <div className="px-2 py-2 text-[var(--color-text-muted)] text-sm">Chargement...</div>
              ) : channelsError ? (
                <div className="px-2 py-2 text-[var(--color-accent-red)] text-sm">{channelsError}</div>
              ) : channels.length === 0 ? (
                <div className="px-2 py-2 text-[var(--color-text-muted)] text-sm italic">Aucun channel</div>
              ) : (
                channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => selectChannel(channel)}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                      selectedChannel?.id === channel.id
                        ? "bg-[var(--color-accent)]/15 text-white"
                        : "text-[var(--color-text-dim)] hover:bg-white/5 hover:text-[var(--color-text)]"
                    }`}
                  >
                    <span className="text-[var(--color-text-muted)]">#</span>
                    <span className="truncate text-sm">{channel.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>

      <div className="h-14 px-2 flex items-center gap-2 bg-[rgba(0,0,0,0.5)] border-t border-[var(--color-border-dim)]">
        <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/50 flex items-center justify-center">
          <span className="text-[var(--color-accent)] text-xs font-bold">
            {user?.username?.charAt(0).toUpperCase() || "?"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.username || "Guest"}</p>
          <p className="text-[10px] text-[var(--color-accent)] font-mono">Connecté</p>
        </div>
      </div>
      </aside>
      ) : (
        <aside className="w-60 bg-[rgba(5,10,15,0.95)] border-r border-[var(--color-border-dim)] flex items-center justify-center">
          <p className="text-[var(--color-text-muted)] text-sm italic">Selectionnez un serveur</p>
        </aside>
      
      )}
      {/* ========== CHAT AREA ========== */}
      <main className="flex-1 flex flex-col bg-[rgba(10,15,20,0.9)]">
        {selectedChannel ? (
          <>
            {/* Channel header */}
            <header className="h-12 px-4 flex items-center border-b border-[var(--color-border-dim)] shadow-md">
              <span className="text-[var(--color-text-muted)] mr-2">#</span>
              <h3 className="font-bold text-white">{selectedChannel.name}</h3>
              <div className="ml-4 w-[1px] h-6 bg-[var(--color-border-dim)]" />
              <p className="ml-4 text-[var(--color-text-muted)] text-sm truncate">
                Bienvenue dans #{selectedChannel.name}
              </p>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-[var(--color-text-muted)]">Chargement des messages...</p>
                </div>
              ) : messagesError ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-[var(--color-accent-red)]">{messagesError}</p>
                </div>
              ) : Array.isArray(messages) && messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 group hover:bg-white/[0.02] -mx-4 px-4 py-1 rounded">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)]/30 to-[var(--color-accent-red)]/20 border border-[var(--color-accent)]/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[var(--color-accent)] font-bold">
                        {msg.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-[var(--color-accent)] hover:underline cursor-pointer">
                          {msg.username}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                          {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[var(--color-text)] leading-relaxed break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[var(--color-accent)]/10 border-2 border-[var(--color-accent)]/30 flex items-center justify-center mb-4">
                    <span className="text-4xl text-[var(--color-accent)]">#</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    Bienvenue dans #{selectedChannel.name}
                  </h4>
                  <p className="text-[var(--color-text-muted)] text-sm mb-2">
                    C&apos;est le debut du channel. Envoyez un message !
                  </p>
                  {messages && messages.length === 0 && (
                    <p className="text-[var(--color-text-muted)] text-xs">
                      Aucun message trouvé
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Message input */}
            <div className="p-4">
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Envoyer un message dans #${selectedChannel.name}`}
                  className="w-full px-4 py-3 bg-[rgba(20,25,30,0.9)] border border-[var(--color-border-dim)] rounded-lg text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_10px_rgba(79,223,255,0.2)] transition-all"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  aria-label="Envoyer le message"
                  title="Envoyer le message"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[var(--color-accent)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="text-[var(--color-accent-red)] text-4xl font-bold italic tracking-[6px] mb-4 animate-pulse drop-shadow-[0_0_20px_rgba(255,51,51,0.4)]">
                HELLO WORLD
              </p>
              <p className="text-[var(--color-text-muted)] text-sm font-mono">
                {selectedServer ? "Selectionnez un channel" : "Selectionnez un serveur pour commencer"}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ========== MEMBER LIST ========== */}
      {selectedServer && (
        <aside className="w-60 bg-[rgba(5,10,15,0.95)] border-l border-[var(--color-border-dim)] overflow-y-auto">
          <div className="p-4">
            <h4 className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-3">
              MEMBRES — {members.length}
            </h4>

            {/* Owners */}
            {members.filter((m) => m.role === "Owner").length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] text-[var(--color-accent-red)] font-bold mb-2 tracking-wider">
                  PROPRIETAIRE
                </p>
                {members
                  .filter((m) => m.role === "Owner")
                  .map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-2 py-1 px-2 rounded hover:bg-white/5 cursor-pointer"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent-red)]/30 to-[var(--color-accent)]/20 border border-[var(--color-accent-red)]/50 flex items-center justify-center">
                          <span className="text-[var(--color-accent-red)] text-xs font-bold">U</span>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[rgba(5,10,15,0.95)] rounded-full" />
                      </div>
                      <span className="text-sm text-[var(--color-text-dim)] truncate">
                        {member.user_id.slice(0, 8)}...
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Members */}
            {members.filter((m) => m.role !== "Owner").length > 0 && (
              <div>
                <p className="text-[10px] text-[var(--color-text-muted)] font-bold mb-2 tracking-wider">
                  MEMBRES
                </p>
                {members
                  .filter((m) => m.role !== "Owner")
                  .map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-2 py-1 px-2 rounded hover:bg-white/5 cursor-pointer"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center">
                          <span className="text-[var(--color-accent)] text-xs font-bold">U</span>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-500 border-2 border-[rgba(5,10,15,0.95)] rounded-full" />
                      </div>
                      <span className="text-sm text-[var(--color-text-dim)] truncate">
                        {member.user_id.slice(0, 8)}...
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ========== MODAL CREATE SERVER ========== */}
      {showCreateServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateServer(false)} />
          <div className="relative bg-[rgba(10,15,20,0.98)] border-2 border-[var(--color-accent)] rounded-lg p-6 w-full max-w-md shadow-[0_0_40px_rgba(79,223,255,0.2)]">
            <h2 className="text-xl font-bold text-center text-white mb-1">Creer un serveur</h2>
            <p className="text-center text-[var(--color-text-muted)] text-sm mb-6">
              Votre serveur sera votre espace de discussion
            </p>
            {serversError && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {serversError}
              </div>
            )}
            <form onSubmit={handleCreateServer}>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
                NOM DU SERVEUR
              </label>
              <input
                type="text"
                value={newServerName}
                onChange={(e) => setNewServerName(e.target.value)}
                placeholder="Mon serveur"
                autoFocus
                className="w-full px-4 py-3 bg-[rgba(0,0,0,0.5)] border border-[var(--color-border-dim)] rounded text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] mb-6"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateServer(false)}
                  className="flex-1 py-2.5 text-[var(--color-text-dim)] hover:text-white hover:underline transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newServerName.trim()}
                  className="flex-1 py-2.5 bg-[var(--color-accent)] text-black font-bold rounded hover:bg-[var(--color-accent)]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Creer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== MODAL CREATE CHANNEL ========== */}
      {showCreateChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateChannel(false)} />
          <div className="relative bg-[rgba(10,15,20,0.98)] border-2 border-[var(--color-accent)] rounded-lg p-6 w-full max-w-md shadow-[0_0_40px_rgba(79,223,255,0.2)]">
            <h2 className="text-xl font-bold text-center text-white mb-1">Creer un channel</h2>
            <p className="text-center text-[var(--color-text-muted)] text-sm mb-6">
              dans {selectedServer?.name}
            </p>
            <form onSubmit={handleCreateChannel}>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
                NOM DU CHANNEL
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none">#</span>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="general"
                  autoFocus
                  className="w-full pl-8 pr-4 py-3 bg-[rgba(0,0,0,0.5)] border border-[var(--color-border-dim)] rounded text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] mb-6"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateChannel(false)}
                  className="flex-1 py-2.5 text-[var(--color-text-dim)] hover:text-white hover:underline transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newChannelName.trim()}
                  className="flex-1 py-2.5 bg-[var(--color-accent)] text-black font-bold rounded hover:bg-[var(--color-accent)]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Creer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}