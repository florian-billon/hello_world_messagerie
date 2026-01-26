import Image from "next/image";

export function Sidebar() {
  return (
    <aside className="w-[260px] p-5 text-white bg-[var(--panel-bg)] flex flex-col border-r-2 border-[var(--cyan)]">
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="Hello World logo"
        width={150}
        height={150}
        className="mb-5"
        priority
      />

      {/* New Message Button */}
      <button className="px-4 py-2.5 bg-[var(--red-primary)] border-2 border-[var(--cyan)] text-white cursor-pointer rounded text-sm transition-all duration-200 hover:bg-[var(--red-hover)] hover:shadow-[0_0_8px_rgba(79,223,255,0.6)]">
        + NEW MESSAGE
      </button>

      {/* Navigation */}
      <nav className="mt-4">
        <h4 className="text-xs tracking-wider opacity-75 my-4">HISTORIQUE</h4>
        <ul className="list-none">
          <li className="text-sm my-1.5">Messages:</li>
        </ul>
        <ul className="list-none">
          <li className="text-sm my-1.5">Servers:</li>
        </ul>
      </nav>

      {/* Bottom Buttons - pushed to bottom with mt-auto */}
      <div className="mt-auto flex flex-col gap-2.5">
        <button className="px-4 py-2.5 bg-[var(--red-primary)] border-2 border-[var(--cyan)] text-white cursor-pointer rounded text-sm transition-all duration-200 hover:bg-[var(--red-hover)] hover:shadow-[0_0_8px_rgba(79,223,255,0.6)]">
          JOIN SERVER
        </button>
        <button className="px-4 py-2.5 bg-[var(--red-primary)] border-2 border-[var(--cyan)] text-white cursor-pointer rounded text-sm transition-all duration-200 hover:bg-[var(--red-hover)] hover:shadow-[0_0_8px_rgba(79,223,255,0.6)]">
          CREATE SERVER
        </button>
      </div>
    </aside>
  );
}

