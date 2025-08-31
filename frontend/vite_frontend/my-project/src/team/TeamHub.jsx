import React from "react";

export default function TeamHub({ team, counts = {}, activeSection = "board", onBack, onNavigate, children }) {
  const sections = [
    { key: "board", title: "Board", icon: "🗂️" },
    { key: "backlog", title: "Backlog", icon: "📚" },
    { key: "sprints", title: "Sprints", icon: "🏃", count: counts.sprints },
    { key: "epics", title: "Epics", icon: "🏔️", count: counts.epics },
    { key: "stories", title: "Stories", icon: "📖", count: counts.stories },
    { key: "tasks", title: "Tasks", icon: "🧩", count: counts.tasks },
    { key: "bugs", title: "Bugs", icon: "🐞", count: counts.bugs },
    { key: "members", title: "Members", icon: "🧑‍🤝‍🧑", count: counts.members }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-white/10 sticky top-0 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70 bg-neutral-950/90 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm">← Back</button>
          <div className="flex-1">
            <div className="text-sm text-neutral-400">Team</div>
            <div className="text-xl font-semibold leading-tight">{team?.name}</div>
            {team?.slug && <div className="text-xs text-neutral-500 font-mono">/{team.slug}</div>}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="rounded-2xl border border-white/10 bg-white/5 p-2">
            {sections.map((s) => {
              const active = activeSection === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => onNavigate?.(s.key)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left hover:bg-white/10 ${active ? "bg-white/10 border border-white/15" : ""}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="grid place-items-center h-6 w-6 rounded-lg bg-white/10 text-sm">{s.icon}</span>
                    <span className="text-sm font-medium">{s.title}</span>
                  </span>
                  {typeof s.count === "number" && (
                    <span className="px-2 py-0.5 rounded-lg bg-white/10 text-[10px]">{s.count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 min-h-[360px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

