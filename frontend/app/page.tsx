import { Sidebar, Chat, MembersSidebar } from "./components";

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <Chat />
        <MembersSidebar />
      </div>
    </main>
  );
}
