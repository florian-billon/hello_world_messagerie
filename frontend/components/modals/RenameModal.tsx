"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n";

type Props = {
  show: boolean;
  title: string;
  initialValue: string;
  onClose: () => void;
  onConfirm: (newName: string) => Promise<void>;
};

export default function RenameModal({ show, title, initialValue, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, show]);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || value.trim() === initialValue) {
        if (!value.trim()) return;
        onClose();
        return;
    }
    
    setLoading(true);
    try {
      await onConfirm(value.trim());
      onClose();
    } catch (err) {
      console.error("Rename failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[rgba(10,15,20,0.95)] border border-[#4fdfff]/30 rounded-xl shadow-[0_0_50px_rgba(79,223,255,0.15)] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{title}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#4fdfff] uppercase tracking-widest mb-1.5 opacity-70">
                {t("channel.nameLabel")}
              </label>
              <input
                type="text"
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-black/40 border border-[#4fdfff]/20 rounded-lg px-4 py-3 text-white outline-none focus:border-[#4fdfff] focus:shadow-[0_0_15px_rgba(79,223,255,0.2)] transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/10 text-white/60 hover:bg-white/5"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={loading || !value.trim()}
                className="flex-1 bg-[#4fdfff] text-black hover:shadow-[0_0_20px_rgba(79,223,255,0.4)] disabled:opacity-50"
              >
                {loading ? t("common.loading") : t("common.save")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
