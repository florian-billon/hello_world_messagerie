import Image from "next/image";
import "./global.css";

export default function AuthPage() {
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

          {/* CONTENEUR DES FORMULAIRES CÔTE À CÔTE */}
          <div className="flex flex-row items-start justify-center gap-8 w-full max-w-5xl">
            
            {/* BOX INSCRIPTION (À GAUCHE) */}
            <section className="w-[380px] p-10 bg-[rgba(20,20,20,0.85)] backdrop-blur-[12px] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] shrink-0 animate-fade-in">
              <div className="text-center mb-8">
                <h3 className="text-white font-bold tracking-widest text-lg">INSCRIPTION</h3>
              </div>
              <form className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Pseudo"
                  className="px-4 py-3 rounded-lg border-none bg-[#1f1f1f] text-white focus:outline-2 focus:outline-red-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="px-4 py-3 rounded-lg border-none bg-[#1f1f1f] text-white focus:outline-2 focus:outline-red-500"
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  className="px-4 py-3 rounded-lg border-none bg-[#1f1f1f] text-white focus:outline-2 focus:outline-red-500"
                />
                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  className="px-4 py-3 rounded-lg border-none bg-[#1f1f1f] text-white focus:outline-2 focus:outline-red-500"
                />
                <button
                  type="submit"
                  className="mt-4 px-4 py-3 rounded-lg bg-red-500 text-black font-bold cursor-pointer hover:bg-red-600 transition-colors"
                >
                  S'INSCRIRE
                </button>
              </form>
            </section>

            {/* BOX CONNEXION (À DROITE) */}
            <section className="w-[380px] p-10 bg-[rgba(20,20,20,0.85)] backdrop-blur-[12px] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] shrink-0 animate-fade-in">
              <div className="text-center mb-8">
                <h3 className="text-white font-bold tracking-widest text-lg">CONNEXION</h3>
              </div>
              <form className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="px-4 py-3 rounded-lg border-none bg-[#1f1f1f] text-white focus:outline-2 focus:outline-red-500"
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  className="px-4 py-3 rounded-lg border-none bg-[#1f1f1f] text-white focus:outline-2 focus:outline-red-500"
                />
                <button
                  type="submit"
                  className="mt-4 px-4 py-3 rounded-lg bg-red-500 text-black font-bold cursor-pointer hover:bg-red-600 transition-colors"
                >
                  SE CONNECTER
                </button>
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