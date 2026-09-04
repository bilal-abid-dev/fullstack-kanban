import { Board } from '@/components/Board';

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#DECCCC]">
      <header className="shrink-0 bg-black px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Kanban Board</h1>
          <div className="flex items-center gap-4 text-sm text-gray">
            <span className="text-white/70">Project Board</span>
          </div>
        </div>
      </header>
      <main className="min-h-0 flex-1">
        <Board />
      </main>
    </div>
  );
}
