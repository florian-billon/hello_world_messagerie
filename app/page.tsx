import Image from "next/image";

export default function Home() {
  // Classe réutilisable pour tes boutons "Action"
  const actionBtn = "p-[10px] bg-[#a00000] border-2 border-[#4fdfff] text-black font-bold cursor-pointer rounded-[4px] text-[13px] transition-all duration-200 hover:bg-[#c00000] hover:shadow-[0_0_8px_rgba(79,223,255,0.6)]";

  return (
    <main className="flex w-full h-screen">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-[260px] p-5 bg-white/30 flex flex-col border-r-2 border-[#4fdfff]">
        <Image
          src="/logo.png"
          alt="Hello World logo"
          width={150}
          height={150}
          className="max-w-full mb-5"
        />
        <button className={actionBtn}>+ NEW MESSAGE</button>

        <nav>
          <h4 className="text-[12px] tracking-[1px] mt-[15px] mb-[6px]">HISTORIQUE</h4>
          <ul className="list-none">
            <li className="text-[14px] my-[6px]">Messages:</li>
          </ul>
          <ul className="list-none">
            <li className="text-[14px] my-[6px]">Servers:</li>
          </ul>
        </nav>

        {/* BOTTOM BUTTONS */}
        <div className="mt-auto flex flex-col gap-[10px]">
          <button className={actionBtn}>JOIN SERVER</button>
          <button className={actionBtn}>CREATE SERVER</button>
        </div>
      </aside>

      {/* CENTER CHAT (WRAPPER FOR CENTRING) */}
      <div className="flex-1 flex justify-center items-stretch p-0 opacity-100">
        <section className="w-full max-w-[1100px] flex flex-col bg-white/30">
          <header className="p-5 border-bottom border-b-2 border-[#4fdfff] text-[16px]">
            <h1>
              Welcome to <span className="text-[#ff3b3b] font-bold">HELLO WORLD</span> messaging platform
            </h1>
          </header>

          <div className="flex-1 flex items-center justify-center tracking-[3px] opacity-100">
            <p className="placeholder">CONVERSATION</p>
          </div>

          <footer className="p-[15px] border-t-2 border-[#4fdfff] opacity-100">
            <input 
              type="text" 
              placeholder="ENTER A MESSAGE" 
              className="w-full p-3 bg-white/30 border-2 border-[#4fdfff] text-black font-bold outline-none opacity-100"
            />
          </footer>
        </section>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="w-[260px] p-5 bg-white/30 flex flex-col border-l-2 border-[#4fdfff]">
        <h3 className="text-[12px] tracking-[1px] mt-[15px] mb-[6px]">MEMBERS</h3>
        <ul className="list-none">
          <li className="text-[14px] my-[6px]">Member 1</li>
          <li className="text-[14px] my-[6px]">Member 2</li>
        </ul>

        <h3 className="text-[12px] tracking-[1px] mt-[15px] mb-[6px]">CONTACT</h3>
        <button className={actionBtn}>Details</button>
      </aside>
    </main>
  );
}