import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HELLO WORLD",
  description: "Real Time Messaging Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="w-full h-full overflow-hidden">
      <body className="w-full h-full font-bold text-white font-[Arial,Helvetica,sans-serif] antialiased [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#4fdfff] [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-track]:bg-black/20 [&_*]:text-white">
        <div className="fixed inset-0 w-screen h-screen overflow-hidden">
          {/* Background avec overlay noir blurry */}
          <div 
            className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat brightness-[0.6] contrast-[1.2] z-0" 
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[1]" />
          <div className="absolute inset-0 z-10 animate-fade-in overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
