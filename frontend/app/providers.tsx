import { I18nProvider } from "@/lib/i18n";
import { ChatProvider } from "@/components/providers/ChatProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ChatProvider>
        {children}
      </ChatProvider>
    </I18nProvider>
  );
}
