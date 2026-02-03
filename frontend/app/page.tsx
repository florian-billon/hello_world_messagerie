"use client";

import { useState } from "react";
import Image from "next/image";
import { logout } from "@/lib/auth/actions";
import { useServers, useChannels, useMessages, useMembers } from "@/hooks";

/**
 * Page principale - Style main (3 colonnes) + Logique channels
 */
export default function Home() {
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

  // Classe réutilisable pour les boutons "Action" avec animations (style main)
  const actionBtn = "p-[10px] bg-[#a00000] border-2 border-[#4fdfff] text-white font-bold cursor-pointer rounded-lg text-[13px] transition-all duration-300 hover:bg-[#c00000] hover:shadow-[0_0_12px_rgba(79,223,255,0.8)] hover:scale-[1.02] active:scale-[0.98]";

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
    await sendMessage(messageInput.trim());
    setMessageInput("");
  };

  if (serversLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[#4fdfff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#4fdfff] font-mono text-sm tracking-widest">
            INITIALIZING...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex w-full h-full gap-2 p-2 min-h-0">
      
      {/* LEFT SIDEBAR - Style main */}
      <aside className="w-[260px] p-5 bg-[rgba(20,20,20,0.85)] backdrop-blur-[12px] flex flex-col border-r-2 border-[#4fdfff] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-fade-in min-h-0 overflow-hidden" style={{ animationDelay: '0.1s' }}>
        <Image
          src="/logo.png"
          alt="Hello World logo"
          width={150}
          height={150}
          className="max-w-full mb-5 drop-shadow-[0_0_10px_rgba(79,223,255,0.5)]"
        />
        
        {/* Liste des serveurs */}
        <div className="mb-4 flex-1 min-h-0 overflow-y-auto">
          <h4 className="text-[12px] tracking-wider uppercase text-[#4fdfff] mt-[15px] mb-[6px] font-bold">SERVEURS</h4>
          <ul className="list-none space-y-2">
            {servers.map((server) => (
              <li key={server.id}>
                <button
                  onClick={() => selectServer(server)}
                  className={`w-full text-left px-3 py-2 rounded text-[14px] transition-colors ${
                    selectedServer?.id === server.id
                      ? "bg-[#4fdfff]/20 text-[#4fdfff] border border-[#4fdfff]"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {server.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <nav className="mt-4 flex-shrink-0">
          <h4 className="text-[12px] tracking-wider uppercase text-[#4fdfff] mt-[15px] mb-[6px] font-bold">HISTORIQUE</h4>
          <ul className="list-none">
            <li className="text-[14px] my-[6px] text-white/80 hover:text-white transition-colors">Messages:</li>
          </ul>
          <ul className="list-none">
            <li className="text-[14px] my-[6px] text-white/80 hover:text-white transition-colors">Servers: {servers.length}</li>
          </ul>
        </nav>

        {/* BOTTOM BUTTONS */}
        <div className="mt-auto flex flex-col gap-[10px] flex-shrink-0">
          <button onClick={() => setShowCreateServer(true)} className={actionBtn}>CREATE SERVER</button>
          <button onClick={() => logout()} className={actionBtn}>LOGOUT</button>
        </div>
      </aside>

      {/* CENTER CHAT - Style main avec logique channels */}
      <div className="flex-1 flex justify-center items-stretch p-0 min-h-0 overflow-hidden">
        <section className="w-full max-w-[1100px] flex flex-col bg-[rgba(20,20,20,0.85)] backdrop-blur-[12px] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-fade-in min-h-0 overflow-hidden" style={{ animationDelay: '0.2s' }}>
          <header className="p-5 border-b-2 border-[#4fdfff] text-[16px] flex-shrink-0">
            <h1 className="text-white font-bold">
              Welcome to <span className="text-[#ff3b3b] font-bold drop-shadow-[0_0_8px_rgba(255,59,59,0.6)]">HELLO WORLD</span> messaging platform
            </h1>
            {selectedServer && (
              <p className="text-white/60 text-sm mt-2">Serveur: {selectedServer.name}</p>
            )}
            {selectedChannel && (
              <p className="text-white/60 text-sm">Channel: #{selectedChannel.name}</p>
            )}
          </header>

          {/* Channels list si serveur sélectionné */}
          {selectedServer && (
            <div className="p-4 border-b border-[#4fdfff]/30 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] tracking-wider uppercase text-[#4fdfff] font-bold">CHANNELS TEXTUELS</h3>
                <button
                  onClick={() => setShowCreateChannel(true)}
                  className="text-[#4fdfff] hover:text-white text-xl font-bold"
                  title="Créer un channel"
                >
                  +
                </button>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {channelsLoading ? (
                  <p className="text-white/60 text-sm">Chargement...</p>
                ) : channelsError ? (
                  <p className="text-[#ff3333] text-sm">{channelsError}</p>
                ) : channels.length === 0 ? (
                  <p className="text-white/60 text-sm italic">Aucun channel</p>
                ) : (
                  channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => selectChannel(channel)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedChannel?.id === channel.id
                          ? "bg-[#4fdfff]/20 text-[#4fdfff]"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      #{channel.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 flex items-center justify-center tracking-[3px] p-4 min-h-0 overflow-hidden">
            {selectedChannel ? (
              <div className="w-full h-full flex flex-col min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
                  {messagesLoading ? (
                    <p className="text-white/40 text-center">Chargement des messages...</p>
                  ) : messagesError ? (
                    <p className="text-[#ff3333] text-center">{messagesError}</p>
                  ) : Array.isArray(messages) && messages.length > 0 ? (
                    messages.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-3 p-2 rounded hover:bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-[#4fdfff]/20 border border-[#4fdfff] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#4fdfff] font-bold">
                            {msg.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-semibold text-[#4fdfff]">{msg.username}</span>
                            <span className="text-[10px] text-white/40 font-mono">
                              {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-white leading-relaxed break-words">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/40 text-center">Aucun message. Envoyez le premier !</p>
                  )}
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="relative flex-shrink-0">
                  <input 
                    type="text" 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Envoyer un message dans #${selectedChannel.name}`}
                    className="w-full p-3 bg-[rgba(31,31,31,0.9)] border-2 border-[#4fdfff] text-white font-bold outline-none rounded-lg placeholder:text-white/50 focus:outline-2 focus:outline-[#ff0000] focus:shadow-[0_0_12px_rgba(79,223,255,0.6)] transition-all duration-300"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#4fdfff] hover:text-white disabled:opacity-30"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </form>
              </div>
            ) : (
              <p className="text-white/40 text-2xl font-bold uppercase animate-pulse">
                {selectedServer ? "SELECTIONNEZ UN CHANNEL" : "SELECTIONNEZ UN SERVEUR"}
              </p>
            )}
          </div>
        </section>
      </div>

      {/* RIGHT SIDEBAR - Style main avec membres de channels */}
      <aside className="w-[260px] p-5 bg-[rgba(20,20,20,0.85)] backdrop-blur-[12px] flex flex-col border-l-2 border-[#4fdfff] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-fade-in min-h-0 overflow-hidden" style={{ animationDelay: '0.3s' }}>
        <h3 className="text-[12px] tracking-wider uppercase text-[#4fdfff] mt-[15px] mb-[6px] font-bold flex-shrink-0">MEMBRES</h3>
        {selectedServer ? (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <p className="text-white/60 text-xs mb-3 flex-shrink-0">— {members.length} membre{members.length > 1 ? 's' : ''}</p>
            <ul className="list-none space-y-2">
              {members.map((member) => (
                <li key={member.user_id} className="flex items-center gap-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-[#4fdfff]/20 border border-[#4fdfff] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#4fdfff] text-xs font-bold">U</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-white/80 truncate">{member.user_id.slice(0, 8)}...</p>
                    <p className="text-[10px] text-[#4fdfff]">{member.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-white/60 text-sm italic">Sélectionnez un serveur</p>
        )}

        <h3 className="text-[12px] tracking-wider uppercase text-[#4fdfff] mt-[15px] mb-[6px] font-bold">CONTACT</h3>
        <button className={actionBtn}>Details</button>
      </aside>

      {/* MODAL CREATE SERVER */}
      {showCreateServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateServer(false)} />
          <div className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#4fdfff] rounded-lg p-6 w-full max-w-md shadow-[0_0_40px_rgba(79,223,255,0.2)]">
            <h2 className="text-xl font-bold text-center text-white mb-1">Créer un serveur</h2>
            <p className="text-center text-white/60 text-sm mb-6">
              Votre serveur sera votre espace de discussion
            </p>
            {serversError && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {serversError}
              </div>
            )}
            <form onSubmit={handleCreateServer}>
              <label className="block text-[10px] font-bold text-white/60 tracking-widest uppercase mb-2">
                NOM DU SERVEUR
              </label>
              <input
                type="text"
                value={newServerName}
                onChange={(e) => setNewServerName(e.target.value)}
                placeholder="Mon serveur"
                autoFocus
                className="w-full px-4 py-3 bg-[rgba(0,0,0,0.5)] border border-[#4fdfff] rounded text-white placeholder:text-white/50 focus:outline-none focus:border-[#4fdfff] mb-6"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateServer(false)}
                  className="flex-1 py-2.5 text-white/60 hover:text-white hover:underline transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newServerName.trim()}
                  className="flex-1 py-2.5 bg-[#4fdfff] text-black font-bold rounded hover:bg-[#4fdfff]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREATE CHANNEL */}
      {showCreateChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateChannel(false)} />
          <div className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#4fdfff] rounded-lg p-6 w-full max-w-md shadow-[0_0_40px_rgba(79,223,255,0.2)]">
            <h2 className="text-xl font-bold text-center text-white mb-1">Créer un channel</h2>
            <p className="text-center text-white/60 text-sm mb-6">
              dans {selectedServer?.name}
            </p>
            <form onSubmit={handleCreateChannel}>
              <label className="block text-[10px] font-bold text-white/60 tracking-widest uppercase mb-2">
                NOM DU CHANNEL
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">#</span>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="general"
                  autoFocus
                  className="w-full pl-8 pr-4 py-3 bg-[rgba(0,0,0,0.5)] border border-[#4fdfff] rounded text-white placeholder:text-white/50 focus:outline-none focus:border-[#4fdfff] mb-6"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateChannel(false)}
                  className="flex-1 py-2.5 text-white/60 hover:text-white hover:underline transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newChannelName.trim()}
                  className="flex-1 py-2.5 bg-[#4fdfff] text-black font-bold rounded hover:bg-[#4fdfff]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
