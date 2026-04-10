"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, useServers } from "@/hooks";
import { getAvatar, normalizeAvatarUrl } from "@/lib/avatar";
import { getStatusColor, getStatusKey } from "@/lib/presence";
import { useTranslation } from "@/lib/i18n";
import SmartImg from "@/components/SmartImg";
import { logout } from "@/lib/auth/actions";

export default function DirectMessagesPage() {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const { servers, selectServer } = useServers();
  const router = useRouter();

  // États locaux pour simuler la sélection d'un ami
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");

  // Simulation d'une liste d'amis/conversations
  const friends = [
    { id: "1", username: "CyberGhost", status: "online", avatar_url: null, lastMsg: "On se capte sur le serveur ?" },
    { id: "2", username: "NeonKnight", status: "idle", avatar_url: null, lastMsg: "Le script est prêt." },
    { id: "3", username: "NightCity_Dev", status: "dnd", avatar_url: null, lastMsg: "Fix en cours..." },
  ];

  return (
    <main className="flex w-full h-screen">
      {/* ========== SERVER SIDEBAR (Réutilisée) ========== */}
      <aside className="w-[72px] bg-[rgba(0,0,0,0.95)] border-r border-[#4fdfff]/20 flex flex-col items-center py-3 gap-2">
        <button
          onClick={() => router.push("/")}
          className="w-12 h-12 rounded-xl bg-[#4fdfff] text-black border border-[#4fdfff]/50 flex items-center justify-center mb-2 shadow-[0_0_12px_rgba(79,223,255,0.6)] group"
        >
          <Image src="/logo.png" alt="HW" width={32} height={32} />
        </button>

        <div className="w-8 h-[2px] bg-[#4fdfff]/20 rounded-full" />

        <div className="flex-1 w-full overflow-y-auto flex flex-col items-center gap-2 py-2">
          {servers.map((server) => (
            <button
              key={server.id}
              onClick={() => {
                selectServer(server);
                router.push("/");
              }}
              className="w-12 h-12 rounded-[24px] bg-[rgba(20,30,40,0.8)] text-[#4fdfff] flex items-center justify-center text-lg font-bold hover:bg-[#4fdfff]/20 hover:rounded-xl transition-all"
            >
              {server.name.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>

        <button onClick={() => logout()} className="w-12 h-12 rounded-[24px] bg-[rgba(40,10,10,0.8)] flex items-center justify-center text-[#ff3333] hover:bg-[#ff3333]/20 hover:rounded-xl transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </aside>

      {/* ========== DM SIDEBAR (Liste des amis) ========== */}
      <aside className="w-60 bg-[rgba(5,10,15,0.95)] border-r border-[#4fdfff]/20 flex flex-col">
        <div className="h-12 px-4 flex items-center border-b border-[#4fdfff]/30 bg-[rgba(0,0,0,0.3)]">
          <input 
            type="text" 
            placeholder="Trouver une conversation" 
            className="w-full bg-black/40 border border-[#4fdfff]/20 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#4fdfff]/50 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 mb-2">
            <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">Messages Directs</span>
          </div>

          {friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded transition-colors ${selectedFriend?.id === friend.id ? "bg-[#4fdfff]/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#4fdfff]/20 border border-[#4fdfff]/30 flex items-center justify-center text-xs font-bold">
                  {friend.username.charAt(0)}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-[rgba(5,10,15,0.95)] rounded-full ${getStatusColor(friend.status)}`} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{friend.username}</p>
                <p className="text-[10px] text-white/30 truncate">{friend.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>

        {/* User Footer (Identique à l'accueil) */}
        <div className="h-14 px-2 flex items-center gap-2 bg-[rgba(0,0,0,0.5)] border-t border-[#4fdfff]/20">
            <div className="flex items-center gap-2 flex-1 min-w-0 p-1">
                <div className="relative">
                    <SmartImg src={normalizeAvatarUrl(user?.avatar_url) || ''} alt="Avatar" className="w-8 h-8 rounded-full border border-[#4fdfff]/50" />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[rgba(5,10,15,0.95)] rounded-full ${getStatusColor(user?.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                    <p className="text-[10px] text-[#4fdfff] font-mono uppercase leading-tight">{t(getStatusKey(user?.status))}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* ========== CHAT CENTER ========== */}
      <div className="flex-1 flex flex-col bg-[rgba(10,15,20,0.98)]">
        {selectedFriend ? (
          <>
            <header className="h-12 px-4 flex items-center justify-between border-b border-[#4fdfff]/20 bg-[rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2">
                <span className="text-[#4fdfff] font-bold text-lg">@</span>
                <span className="text-white font-semibold">{selectedFriend.username}</span>
                <div className={`w-2 h-2 rounded-full ml-1 ${getStatusColor(selectedFriend.status)}`} />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-end">
              {/* Simulation de messages */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-center py-10 border-b border-[#4fdfff]/10 mb-4">
                    <div className="w-20 h-20 rounded-full bg-[#4fdfff]/10 border-2 border-[#4fdfff]/30 flex items-center justify-center mx-auto">
                        <span className="text-4xl text-[#4fdfff]">{selectedFriend.username.charAt(0)}</span>
                    </div>
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-white">{selectedFriend.username}</h2>
                        <p className="text-white/40 text-sm">C'est le début de votre historique de messages avec @{selectedFriend.username}</p>
                    </div>
                </div>
              </div>
            </div>

            <footer className="px-4 py-3 border-t border-[#4fdfff]/20 bg-[rgba(0,0,0,0.2)]">
              <form onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Envoyer un message à @${selectedFriend.username}`}
                  className="w-full px-4 py-2.5 bg-[rgba(20,20,20,0.8)] border border-[#4fdfff]/30 rounded-lg text-white placeholder:text-white/40 outline-none focus:border-[#4fdfff] transition-all"
                />
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-24 h-24 rounded-full bg-[#4fdfff]/10 border-2 border-[#4fdfff]/30 flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-[#4fdfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Tes Messages Privés</h2>
            <p className="text-white/50 max-w-sm">Sélectionne un ami dans la liste à gauche pour commencer à discuter dans la Night City.</p>
          </div>
        )}
      </div>
    </main>
  );
}