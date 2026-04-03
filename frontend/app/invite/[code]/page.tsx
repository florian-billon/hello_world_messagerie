"use client";

import { useEffect, useState } from "react";
import { getInvite, acceptInvite } from "@/lib/api-server";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import Button from "@/components/ui/Button";

interface InviteData {
  code: string;
  server_id: string;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
}

export default function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [code, setCode] = useState<string>("");

  const isAuthRequiredError = (message: string) =>
    message === "error.authRequired" ||
    message.toLowerCase().includes("authentication required") ||
    message.includes("401");

  const resolveError = (error: unknown, fallbackKey = "error.default") => {
    const message = error instanceof Error ? error.message : String(error ?? "");
    if (message.startsWith("error.")) {
      return t(message);
    }
    return message || t(fallbackKey);
  };

  useEffect(() => {
    (async () => {
      const { code: pCode } = await params;
      setCode(pCode);
      try {
        const data = await getInvite(pCode);
        setInvite(data);
      } catch (e: any) {
        const msg = String(e?.message || "");
        if (isAuthRequiredError(msg)) {
          router.push(`/login?next=/invite/${pCode}`);
        } else {
          setError(t("invite.invalidDescription"));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [params, router, t]);

  const onJoin = async () => {
    if (!code) return;
    setAccepting(true);
    try {
      await acceptInvite(code);
      router.push("/");
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (isAuthRequiredError(msg)) {
        router.push(`/login?next=/invite/${code}`);
      } else if (msg.includes("Already a member")) {
        router.push("/");
      } else {
        setError(resolveError(e));
      }
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-16 h-16 border-2 border-[#4fdfff] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (error || !invite) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-[rgba(20,20,20,0.92)] border-2 border-[#ff3333] rounded-xl p-6 shadow-[0_0_40px_rgba(255,51,51,0.25)]">
          <h1 className="text-white font-bold text-xl mb-2">{t("invite.invalidTitle")}</h1>
          <p className="text-white/60 text-sm">
            {error || t("invite.invalidDescription")}
          </p>
          <Button
            variant="outline"
            size="md"
            onClick={() => router.push("/")}
            className="mt-6"
          >
            {t("common.appName")}
          </Button>
        </div>
      </main>
    );
  }

  const expiresText = invite.expires_at ? new Date(invite.expires_at).toLocaleString() : t("invite.never");
  const maxUsesText = invite.max_uses ?? t("invite.unlimited");

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-[rgba(20,20,20,0.92)] border-2 border-[#4fdfff] rounded-xl p-6 shadow-[0_0_40px_rgba(79,223,255,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-white font-bold text-xl">
              {t("invite.title")}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {t("invite.inviteCode")} <span className="text-[#4fdfff] font-mono">{invite.code}</span>
            </p>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-lg border border-[#4fdfff]/40 bg-black/30">
          <p className="text-white/70 text-sm">
            {t("invite.serverId")} <span className="text-white font-mono">{invite.server_id}</span>
          </p>
          <p className="text-white/70 text-sm mt-2">
            {t("invite.maxUses")} <span className="text-white font-mono">{maxUsesText}</span> • {t("invite.uses")}{" "}
            <span className="text-white font-mono">{invite.uses}</span>
          </p>
          <p className="text-white/70 text-sm mt-2">
            {t("invite.expires")} <span className="text-white font-mono">{expiresText}</span>
          </p>
          <p className="text-white/40 text-xs mt-3">
            {t("invite.joinInfo")}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={onJoin}
            isLoading={accepting}
            className="flex-1 uppercase"
          >
            {t("invite.joinButton")}
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => router.push("/")}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </main>
  );
}