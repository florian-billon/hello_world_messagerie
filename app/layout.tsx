import "./globals.css";

export const metadata = {
  title: "HELLO WORLD",
  description: "Real Time Messaging Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <div className="relative w-screen h-screen">
          {/* BACKGROUND COMPONENT */}
          <div 
            className="fixed inset-0 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat brightness-[0.7] contrast-[1.1] z-0" 
          />
          {/* CONTENT OVER BACKGROUND */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}