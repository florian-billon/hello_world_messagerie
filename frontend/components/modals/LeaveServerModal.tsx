"use client";
import { useTranslation } from "@/lib/i18n";
import { ServerMember } from "@/lib/api-client";
import Button from "@/components/ui/Button";

type Props = {
  show: boolean;
  serverName: string;
  isOwner: boolean;
  transferCandidates: ServerMember[];
  newOwnerId: string;
  error: string | null;
  onClose: () => void;
  onChangeNewOwner: (id: string) => void;
  onConfirm: () => void;
};

export default function LeaveServerModal({
  show, serverName, isOwner, transferCandidates, newOwnerId, error, onClose, onChangeNewOwner, onConfirm,
}: Props) {
  const { t } = useTranslation();
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#ff3333] rounded-xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(255,51,51,0.3)]">
        <h2 className="text-xl font-bold text-center text-white mb-2">{t("server.confirmLeave.title")}</h2>
        <p className="text-center text-white/60 text-sm mb-6">
          {t("server.confirmLeave.message", { serverName })}
        </p>
        {isOwner && (
          <div className="mb-4">
            <label htmlFor="new-owner" className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">
              {t("server.confirmLeave.transferLabel")}
            </label>
            <select
              id="new-owner"
              value={newOwnerId}
              onChange={(e) => onChangeNewOwner(e.target.value)}
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
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="md" onClick={onClose} className="flex-1">
            {t("common.cancel")}
          </Button>
          <Button type="button" variant="danger" size="md" onClick={onConfirm} className="flex-1">
            {t("server.leave")}
          </Button>
        </div>
      </div>
    </div>
  );
}
