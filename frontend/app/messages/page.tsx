"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, useServers } from "@/hooks";
import { normalizeAvatarUrl } from "@/lib/avatar";
import { getStatusKey } from "@/lib/presence";
import { useTranslation } from "@/lib/i18n";
import SmartImg from "@/components/SmartImg";
import { logout } from "@/lib/auth/actions";
import Button from "@/components/ui/Button";
import {
  createDirectConversation,
  DirectConversation,
  DirectMessage,
  listDirectConversations,
  listDirectMessages,
  sendDirectMessage,
} from "@/lib/api-server";

export default function DirectMessagesPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { servers, selectServer } = useServers();
  const router = useRouter();

  // ÉTATS
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId);

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
    const fetchMessages = async () => {
      if (!selectedConversationId) {
        setMessages([]);
        return;
      }

      try {
        const data = await listDirectMessages(selectedConversationId);
        setMessages(data);
        setError(null);
      } catch (error) {
        console.error("Erreur lors du chargement des messages privés:", error);
        setError("Impossible de charger les messages privés.");
      }
    };

    fetchMessages();
  }, [selectedConversationId]);

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    try {
      const newConv = await createDirectConversation(searchUsername.trim());

      setConversations((prev) => {
        const exists = prev.find((c) => c.id === newConv.id);
        return exists ? prev : [newConv, ...prev];
      });

      setSelectedConversationId(newConv.id);
      setShowNewChatModal(false);
      setSearchUsername("");
      setError(null);

    } catch (error) {
      console.error("Erreur technique lors du lancement de la conversation:", error);
      setError("Utilisateur introuvable ou conversation impossible.");
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversationId || !messageInput.trim()) return;

    try {
      const sentMessage = await sendDirectMessage(selectedConversationId, messageInput.trim());
      setMessages((prev) => [...prev, sentMessage]);
      setMessageInput("");
      setError(null);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message privé:", error);
      setError("Impossible d'envoyer le message privé.");
    }
  };

  return (
    <main className="flex w-full h-screen">
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
      <aside className="w-60 bg-[rgba(5,10,15,0.95)] border-r border-[#4fdfff]/20 flex flex-col">
        <div className="h-12 px-4 flex items-center border-b border-[#4fdfff]/30 bg-[rgba(0,0,0,0.3)]">
           <div className="relative w-full">
            <input 
                type="text" 
                placeholder="Trouver une conversation" 
                className="w-full bg-black/40 border border-[#4fdfff]/20 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#4fdfff]/50"
            />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
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
              onClick={() => setSelectedConversationId(conv.id)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded transition-colors ${selectedConversationId === conv.id ? "bg-[#4fdfff]/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#4fdfff]/20 border border-[#4fdfff]/30 flex items-center justify-center text-xs font-bold">
                {conv.username.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{conv.username}</p>
              </div>
            </button>
          ))}
        </div>

        {/* User Footer */}
        <div className="h-14 px-2 flex items-center gap-2 bg-[rgba(0,0,0,0.5)] border-t border-[#4fdfff]/20">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <SmartImg src={normalizeAvatarUrl(currentUser?.avatar_url) || ''} alt="Avatar" className="w-8 h-8 rounded-full border border-[#4fdfff]/50" />
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
      <div className="flex-1 flex flex-col bg-[rgba(10,15,20,0.98)]">
        {selectedConversationId ? (
           <div className="flex-1 flex flex-col">
              <header className="h-12 border-b border-[#4fdfff]/20 flex items-center px-4 text-white font-bold">
                {selectedConversation ? `@${selectedConversation.username}` : "Conversation"}
              </header>
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {error && <p className="text-sm text-[#ff3333]">{error}</p>}
                {messages.length === 0 && (
                  <p className="text-sm text-white/40">Aucun message pour le moment.</p>
                )}
                {messages.map((message) => (
                  <div key={message.id} className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-[#4fdfff]">{message.username}</span>
                      <span className="text-[10px] text-white/30">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendDirectMessage} className="border-t border-[#4fdfff]/20 p-3 flex gap-2">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={selectedConversation ? `Message @${selectedConversation.username}` : "Message"}
                  className="flex-1 bg-black/40 border border-[#4fdfff]/20 rounded px-3 py-2 text-sm text-white outline-none focus:border-[#4fdfff]/50"
                />
                <Button type="submit" className="bg-[#4fdfff] text-black">
                  Envoyer
                </Button>
              </form>
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowNewChatModal(false)} />
          <form onSubmit={handleStartConversation} className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#4fdfff] rounded-xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(79,223,255,0.2)]">
            <h2 className="text-xl font-bold text-white mb-4">Nouvelle conversation</h2>
            <p className="text-white/60 text-sm mb-4">Saisis le pseudo de ton contact pour initier un lien sécurisé.</p>
            
            <input
              autoFocus
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Pseudo (ex: CyberGhost)"
              className="w-full bg-black/50 border border-[#4fdfff]/30 rounded-lg p-3 text-white outline-none focus:border-[#4fdfff] mb-6"
            />

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowNewChatModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-[#4fdfff] text-black">
                Lancer
              </Button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
