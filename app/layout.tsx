import "./globals.css";

export const metadata = {
  title: "HELLO WORLD",
  description: "Real Time Messaging Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <div className="app">
          <div className="background" />
          {children}
        </div>
      </body>
    </html>
  );
}
