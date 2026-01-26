import Image from "next/image";

export default function Home() {
  return (
    <main className="app">
      {/* BACKGROUND */}
      <div className="background" />

      {/* MAIN FLEX LAYOUT */}
      <div className="main-layout">
        {/* LEFT SIDEBAR */}
        <aside className="sidebar left">
          <Image
            src="/logo.png"
            alt="Hello World logo"
            width={150}
            height={150}
          />
          <button className="action">+ NEW MESSAGE</button>

          <nav>
            <h4>HISTORIQUE</h4>
            <ul>
              <li>Messages:</li>
            </ul>
            <ul>
              <li>Servers:</li>
            </ul>
          </nav>
           {/* BOTTOM BUTTONS */}
          <div className="sidebar-bottom">
            <button className="action">JOIN SERVER</button>
            <button className="action">CREATE SERVER</button>
          </div>
        </aside>


        {/* CENTER CHAT (WRAPPER FOR CENTRING) */}
        <div className="chat-wrapper">
          <section className="chat">
            <header className="chat-header">
              <h1>
                Welcome to <span>HELLO WORLD</span> messaging platform
              </h1>
            </header>

            <div className="messages">
              <p className="placeholder">CONVERSATION</p>
            </div>

            <footer className="chat-input">
              <input type="text" placeholder="ENTER A MESSAGE" />
            </footer>
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="sidebar right">
          <h3>MEMBERS</h3>
          <ul>
            <li>Member 1</li>
            <li>Member 2</li>
          </ul>

          <h3>CONTACT</h3>
          <button className="action">Details</button>
        </aside>
      </div>
    </main>
  );
}
