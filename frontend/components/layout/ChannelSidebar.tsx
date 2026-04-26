"use client";
import { useTranslation } from "@/lib/i18n";
import { Server, Channel, ServerMember } from "@/lib/api-client";

type Props = {
  selectedServer: Server | null;
  channels: Channel[];
  visibleChannels: Channel[];
  selectedChannel: Channel | null;
  channelSearch: string;
  channelsLoading: boolean;
  channelsError: string | null;
  canManageChannels: boolean;
  isServerOwner: boolean;
  transferCandidates: ServerMember[];
  onSelectChannel: (channel: Channel) => void;
  onChannelSearch: (serverId: string, value: string) => void;
  onCreateChannel: () => void;
  onCreateServer: () => void;
  onDeleteChannel: (id: string, name: string) => void;
  onShowLeave: () => void;
};

export default function ChannelSidebar({
  selectedServer, channels, visibleChannels, selectedChannel, channelSearch,
  channelsLoading, channelsError, canManageChannels, onSelectChannel,
  onChannelSearch, onCreateChannel, onCreateServer, onDeleteChannel, onShowLeave,
}: Props) {
  const { t } = useTranslation();

  return (
    <aside className="w-60 bg-[rgba(5,10,15,0.95)] border-r border-[#4fdfff]/20 flex flex-col min-h-0">
      {selectedServer ? (
        <>
          <div className="h-12 px-4 flex items-center justify-between border-b border-[#4fdfff]/30 shadow-lg bg-[rgba(0,0,0,0.3)]">
            <h2 className="font-bold text-white truncate flex-1 uppercase tracking-widest text-[10px]">channels</h2>
            <button
              type="button"
              onClick={onCreateChannel}
              className="text-[#4fdfff] hover:text-white transition-colors text-xl font-bold"
              title={t("channel.createTooltip")}
            >
              +
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 min-h-0">
            <div className="px-2 mb-3">
              <input
                type="text"
                value={channelSearch}
                onChange={(e) => onChannelSearch(selectedServer.id, e.target.value)}
                placeholder={t("channel.searchPlaceholder")}
                className="w-full bg-black/40 border border-[#4fdfff]/20 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#4fdfff]/50"
              />
            </div>

            <div className="space-y-[2px]">
              {channelsLoading ? (
                <div className="px-2 py-2 text-white/40 text-sm">{t("common.loading")}</div>
              ) : channelsError ? (
                <div className="px-2 py-2 text-[#ff3333] text-sm">{channelsError}</div>
              ) : channels.length === 0 ? (
                <div className="px-2 py-2 text-white/40 text-sm italic">{t("chat.noChannel")}</div>
              ) : visibleChannels.length === 0 ? (
                <div className="px-2 py-2 text-white/40 text-sm italic">{t("channel.noResults")}</div>
              ) : (
                visibleChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`group w-full flex items-center rounded transition-colors ${
                      selectedChannel?.id === channel.id ? "bg-[#4fdfff]/15" : "hover:bg-white/5"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectChannel(channel)}
                      className={`flex-1 text-left px-2 py-1.5 flex items-center gap-2 ${
                        selectedChannel?.id === channel.id ? "text-white" : "text-white/60 group-hover:text-white"
                      }`}
                    >
                      <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
                        <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
                      </svg>
                      <span className="truncate text-sm">{channel.name}</span>
                    </button>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 pr-2 transition-all">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onShowLeave(); }}
                        className="text-white/30 hover:text-[#ff3333] transition-colors"
                        title={t("server.leave")}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>

                      {canManageChannels && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onDeleteChannel(channel.id, channel.name); }}
                          className="text-white/20 hover:text-[#ff3333] transition-colors"
                          title={t("channel.deleteTooltip")}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="h-12 px-4 flex items-center justify-between border-b border-[#4fdfff]/30 shadow-lg bg-[rgba(0,0,0,0.3)]">
            <h2 className="font-bold text-white truncate flex-1 uppercase tracking-widest text-[10px]">channels</h2>
            <button
              onClick={onCreateServer}
              className="text-[#4fdfff] hover:text-white transition-colors text-xl font-bold"
              title={t("server.createTooltip")}
            >
              +
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 min-h-0">
            <div className="px-2 mb-3">
              <input
                type="text"
                value=""
                placeholder={t("channel.searchPlaceholder")}
                disabled
                readOnly
                className="w-full bg-black/40 border border-[#4fdfff]/20 rounded px-2 py-1.5 text-xs text-white outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
