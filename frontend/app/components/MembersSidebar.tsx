export function MembersSidebar() {
  return (
    <aside className="w-[260px] p-5 text-white bg-[var(--panel-bg)] flex flex-col border-l-2 border-[var(--cyan)]">
      {/* Members section */}
      <h3 className="text-xs tracking-wider opacity-75 mb-2">MEMBERS</h3>
      <ul className="list-none">
        <li className="text-sm my-1.5">Member 1</li>
        <li className="text-sm my-1.5">Member 2</li>
      </ul>

      {/* Contact section */}
      <h3 className="text-xs tracking-wider opacity-75 mt-4 mb-2">CONTACT</h3>
      <button className="px-4 py-2.5 bg-[var(--red-primary)] border-2 border-[var(--cyan)] text-white cursor-pointer rounded text-sm transition-all duration-200 hover:bg-[var(--red-hover)] hover:shadow-[0_0_8px_rgba(79,223,255,0.6)]">
        Details
      </button>
    </aside>
  );
}

