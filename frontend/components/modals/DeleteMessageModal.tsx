"use client";
import { useTranslation } from "@/lib/i18n";
import Button from "@/components/ui/Button";

type Props = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteMessageModal({ show, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[rgba(20,20,20,0.98)] border-2 border-[#ff3333] rounded-xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(255,51,51,0.3)]">
        <h2 className="text-xl font-bold text-center text-white mb-2">{t("chat.confirmDeleteTitle")}</h2>
        <p className="text-center text-white/60 text-sm mb-6">{t("chat.confirmDeleteMessage")}</p>
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="md" onClick={onClose} className="flex-1">
            {t("common.cancel")}
          </Button>
          <Button type="button" variant="danger" size="md" onClick={onConfirm} className="flex-1">
            {t("chat.delete")}
          </Button>
        </div>
      </div>
    </div>
  );
}
