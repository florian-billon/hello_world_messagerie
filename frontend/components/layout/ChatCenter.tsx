"use client";
import { useTranslation } from "@/lib/i18n";
import { Server, Channel, Message, User } from "@/lib/api-client";
import { getAvatar } from "@/lib/avatar";
import SmartImg from "@/components/ui/SmartImg";
import Button from "@/components/ui/Button";
import MessageReactions from "@/components/chat/MessageReactions";
import GifPicker from "@/components/chat/GifPicker";

type Props = {
  selectedServer: Server | null;
  selectedChannel: Channel | null;
  messages: Message[];
  messagesLoading: boolean;
  messagesError: string | null;
  messageInput: string;
  showGifPicker: boolean;
  editingMessageId: string | null;
  editContent: string;
  typingUsers: Map<string, string>;
  user: User | null;
  currentUser: User | null;
  viewerId: string | undefined;
  onCreateServer: () => void;
  onCreateChannel: () => void;
  onSendMessage: (e: React.FormEvent) => void;
  onMessageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMessageInputFocus: () => void;
  onMessageInputBlur: () => void;
  onToggleGifPicker: () => void;
  onSendGif: (url: string) => Promise<void>;
  onStartEdit: (message: Message) => void;
  onSaveEdit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  onEditContentChange: (val: string) => void;
  onDeleteMessage: (id: string) => void;
  onOpenUserProfile: (userId: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => Promise<boolean>;
};

export default function ChatCenter({
  selectedServer, selectedChannel, messages, messagesLoading, messagesError,
  messageInput, showGifPicker, editingMessageId, editContent, typingUsers,
  user, currentUser, viewerId,
  onCreateServer, onCreateChannel, onSendMessage, onMessageInputChange,
  onMessageInputFocus, onMessageInputBlur, onToggleGifPicker, onSendGif,
  onStartEdit, onSaveEdit, onCancelEdit, onEditContentChange,
  onDeleteMessage, onOpenUserProfile, onToggleReaction,
}: Props) {
  const { t, locale } = useTranslation();
  const userForAvatar = currentUser || user;

  const renderEmpty = () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center group">
        <div className="w-32 h-32 rounded-full bg-[#4fdfff]/5 border-2 border-[#4fdfff]/20 flex items-center justify-center mb-8 mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-[#4fdfff]/5 blur-xl group-hover:blur-2xl transition-all" />
          <svg className="w-16 h-16 text-[#4fdfff] relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" />
          </svg>
        </div>
        <div className="flex flex-col items-center">
          {!selectedServer ? (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">{t("chat.selectServer")}</h2>
              <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">{t("chat.selectServerPrompt")}</p>
              <Button onClick={onCreateServer} variant="outline" className="mt-8 border-[#4fdfff] text-[#4fdfff] px-8 py-6 text-lg hover:bg-[#4fdfff]/10 transition-all font-bold mx-auto">
                {t("chat.createServerButton")}
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">{t("channel.createTitle")}</h2>
              <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">{t("channel.createDescription", { serverName: selectedServer.name })}</p>
              <Button onClick={onCreateChannel} variant="outline" className="mt-8 border-[#4fdfff] text-[#4fdfff] px-8 py-6 text-lg hover:bg-[#4fdfff]/10 transition-all font-bold mx-auto">
                {t("channel.createTitle")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderMessages = () => {
    if (messagesLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#4fdfff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#4fdfff] text-sm">{t("chat.loadingMessages")}</p>
          </div>
        </div>
      );
    }
    if (messagesError) {
      return <div className="h-full flex items-center justify-center"><p className="text-[#ff3333]">{messagesError}</p></div>;
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
          <div className="w-32 h-32 rounded-full bg-[#4fdfff]/5 border-2 border-[#4fdfff]/20 flex items-center justify-center mb-8 mx-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#4fdfff]/5 blur-xl group-hover:blur-2xl transition-all" />
            <svg className="w-16 h-16 text-[#4fdfff] relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-white mb-2">{t("chat.welcomeChannel", { channelName: selectedChannel!.name })}</h4>
          <p className="text-white/50 text-sm">{t("chat.channelStart")}</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-3 px-4 py-2 rounded hover:bg-white/5 transition-colors group">
            <button type="button" onClick={() => onOpenUserProfile(msg.author_id)} className="flex-shrink-0" title={msg.username}>
              <SmartImg
                src={getAvatar(msg.author_id, userForAvatar)}
                alt={msg.username}
                className="w-10 h-10 rounded-full object-cover border border-[#4fdfff]/30 group-hover:border-[#4fdfff]/50 transition-colors"
              />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <button type="button" onClick={() => onOpenUserProfile(msg.author_id)} className="font-semibold text-white hover:text-[#4fdfff] transition-colors cursor-pointer">
                  {msg.username}
                </button>
                <span className="text-xs text-white/40">
                  {new Date(msg.created_at).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                  {msg.edited_at && <span className="ml-1 text-[10px] text-white/20 italic">{t("chat.edited")}</span>}
                </span>
              </div>
              {editingMessageId === msg.id ? (
                <form onSubmit={onSaveEdit} className="mt-1">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => onEditContentChange(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === "Escape" && onCancelEdit()}
                    placeholder={t("chat.editPlaceholder")}
                    aria-label={t("chat.editPlaceholder")}
                    className="w-full px-3 py-1.5 bg-black/50 border border-[#4fdfff]/50 rounded text-white text-sm outline-none focus:border-[#4fdfff]"
                  />
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="text-[10px] text-[#4fdfff] hover:underline font-bold uppercase">{t("chat.save")}</button>
                    <button type="button" onClick={onCancelEdit} className="text-[10px] text-white/40 hover:underline font-bold uppercase">{t("common.cancel")}</button>
                  </div>
                </form>
              ) : msg.content.includes("giphy.com") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={msg.content} alt="GIF" className="max-w-xs max-h-48 rounded-lg mt-1" loading="lazy" />
              ) : (
                <p className="text-white/90 leading-relaxed break-all whitespace-pre-wrap">{msg.content}</p>
              )}
              {!editingMessageId && (
                <MessageReactions
                  messageId={msg.id}
                  reactions={msg.reactions ?? []}
                  viewerId={viewerId}
                  onToggleReaction={onToggleReaction}
                  addReactionLabel={t("chat.addReaction")}
                />
              )}
            </div>
            {!editingMessageId && msg.author_id === user?.id && (
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all ml-auto self-start">
                <button type="button" onClick={() => onStartEdit(msg)} className="p-1.5 text-white/40 hover:text-[#4fdfff] transition-colors" title={t("chat.edit")}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button type="button" onClick={() => onDeleteMessage(msg.id)} className="p-1.5 text-white/40 hover:text-[#ff3333] transition-colors" title={t("chat.delete")}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[rgba(10,15,20,0.98)]">
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedChannel ? renderEmpty() : renderMessages()}
      </div>

      {selectedChannel && (
        <footer className="px-4 py-3 border-t border-[#4fdfff]/20 bg-[rgba(0,0,0,0.2)]">
          {typingUsers.size > 0 && (() => {
            const entries = Array.from(typingUsers.entries()).filter(([id]) => id !== user?.id);
            if (entries.length === 0) return null;
            const names = entries.map(([, name]) => name).join(", ");
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
          <div className="relative">
            {showGifPicker && (
              <GifPicker
                onSelect={async (gifUrl) => { await onSendGif(gifUrl); }}
                onClose={() => onToggleGifPicker()}
                searchPlaceholder={t("chat.gifSearch")}
              />
            )}
            <form onSubmit={onSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleGifPicker}
                className="px-2 py-2 text-xs font-bold text-[#4fdfff] border border-[#4fdfff]/40 rounded-lg hover:bg-[#4fdfff]/10 transition-colors flex-shrink-0"
                title={t("chat.gifTooltip")}
              >
                GIF
              </button>
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
                    <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
                  </svg>
                </div>
                <input
                  value={messageInput}
                  onChange={onMessageInputChange}
                  onFocus={onMessageInputFocus}
                  onBlur={onMessageInputBlur}
                  placeholder={`Message #${selectedChannel.name}`}
                  className="w-full pl-10 pr-4 py-2.5 bg-[rgba(20,20,20,0.8)] border border-[#4fdfff]/30 rounded-lg text-white placeholder:text-white/40 outline-none focus:border-[#4fdfff] focus:bg-[rgba(20,20,20,0.95)] focus:shadow-[0_0_8px_rgba(79,223,255,0.3)] transition-all"
                />
              </div>
            </form>
          </div>
        </footer>
      )}
    </div>
  );
}
