import Image from "next/image";
import "./global.css";

export default function CreateAccountPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat brightness-[0.7] contrast-[1.1] z-0" />

      {/* MAIN LAYOUT */}
      <div className="relative z-10 flex w-full h-full">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-[260px] p-5 bg-white/20 border-r-2 border-[#4fdfff] flex flex-col shrink-0">
          <Image
            src="/logo.png"
            alt="Hello World logo"
            width={150}
            height={150}
            className="mb-5"
          />
        </aside>
        
        {/* CENTER CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-x-hidden overflow-y-auto">
          
          {/* Header Message */}
          <header className="mb-10 text-center">
            <h1 className="text-white text-xl font-bold">
              Welcome to <span className="text-[#ff3b3b]">HELLO WORLD</span> messaging platform
            </h1>
          </header>

          {/* CONTENEUR DES FORMULAIRES */}
          <div className="flex flex-row items-start justify-center gap-8 w-full max-w-5xl">
            {/* BOX INSCRIPTION (À GAUCHE) */}
            <section className="auth-layout shrink-0">
              <div className="auth-header">
                <h3 className="text-white font-bold tracking-widest text-lg">INSCRIPTION</h3>
              </div>
              <form className="auth-form">
                <input type="text" placeholder="Pseudo" />
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Mot de passe" />
                <input type="password" placeholder="Confirmer le mot de passe" />
                <button type="submit" className="action primary">S'INSCRIRE</button>
              </form>
            </section>

          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="w-[260px] p-5 bg-white/20 border-l-2 border-[#4fdfff] shrink-0" />
      </div>
    </main>
  );
}