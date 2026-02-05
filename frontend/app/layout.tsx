import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HELLO WORLD",
  description: "Real Time Messaging Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {/* Background avec image et overlay */}
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/background.png')" }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* Contenu */}
        <div className="relative z-10 w-full h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
