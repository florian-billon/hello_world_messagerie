"use client";
import { useTranslation } from "@/lib/i18n";
import Button from "@/components/ui/Button";

type Props = {
  show: boolean;
  serverName: string;
  error: string | null;
  creating: boolean;
  onClose: () => void;
  onChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function CreateServerModal({ show, serverName, error, creating, onClose, onChange, onSubmit }: Props) {
  const { t } = useTranslation();
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#4fdfff] rounded-xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(79,223,255,0.3)]">
        <h2 className="text-xl font-bold text-center text-white mb-1">{t("server.createTitle")}</h2>
        <p className="text-center text-white/50 text-sm mb-6">{t("server.createDescription")}</p>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}
        <form onSubmit={onSubmit}>
          <label className="block text-[10px] font-bold text-[#4fdfff] tracking-widest uppercase mb-2">
            {t("server.nameLabel")}
          </label>
          <input
            type="text"
            value={serverName}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("server.namePlaceholder")}
            autoFocus
            className="w-full px-4 py-3 bg-black/50 border-2 border-[#4fdfff]/50 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#4fdfff] focus:shadow-[0_0_10px_rgba(79,223,255,0.3)] mb-6 transition-all"
          />
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="md" disabled={creating} onClick={onClose} className="flex-1">
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={creating} disabled={creating || !serverName.trim()} className="flex-1 uppercase">
              {t("common.create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
