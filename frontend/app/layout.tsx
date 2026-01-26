import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HELLO WORLD",
  description: "Real Time Messaging Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
        <div className="min-h-screen bg-black/50">{children}</div>
      </body>
    </html>
  );
}
