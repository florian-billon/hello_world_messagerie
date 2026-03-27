"use client";

import { useTranslation } from "@/lib/i18n";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-[rgba(20,20,20,0.92)] border-2 border-[#ff3333] rounded-xl p-6 shadow-[0_0_40px_rgba(255,51,51,0.25)]">
        <h1 className="text-white font-bold text-xl mb-2">
          {t("error.title")}
        </h1>
        <p className="text-white/60 text-sm mb-4">
          {error.message || t("error.default")}
        </p>
        {error.digest && (
          <p className="text-white/40 text-xs mb-4 font-mono">
            {t("error.digest")} {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="p-[10px] bg-[#a00000] border-2 border-[#4fdfff] text-white font-bold cursor-pointer rounded-lg text-[13px] uppercase transition-all duration-300 hover:bg-[#c00000] hover:shadow-[0_0_12px_rgba(79,223,255,0.8)] hover:scale-[1.02] active:scale-[0.98]"
        >
          {t("common.tryAgain")}
        </button>
      </div>
    </main>
  );
}
