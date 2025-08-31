export default function HomePage() {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {/* Nav */}
        <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
          <nav className="flex h-16 w-full max-w-none items-center justify-between px-6 md:px-10">
            <a href="/" className="group inline-flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-emerald-500 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium tracking-wide text-zinc-300 group-hover:text-zinc-100">CollabTasks</span>
            </a>
            <div className="flex items-center gap-2">
              <a href="/login" className="px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100">Log in</a>
              <a
                href="/signup"
                className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400"
              >
                Sign up
              </a>
            </div>
          </nav>
        </header>
  
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(16,185,129,0.10),transparent_60%),radial-gradient(40rem_30rem_at_100%_20%,rgba(99,102,241,0.08),transparent_60%)]" />
          <div className="grid w-full max-w-none gap-10 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28 md:px-10">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Collaborate & manage tasks with ease
              </h1>
              <p className="mt-4 max-w-prose text-zinc-400">
                A modern project management tool. Create boards, assign tasks, and track your team’s progress all in one clean, minimal workspace.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/signup"
                  className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400"
                >
                  Get started
                </a>
                <a
                  href="#features"
                  className="rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
                >
                  Learn more
                </a>
              </div>
              <div className="mt-6 text-xs text-zinc-500">
                Free for small teams · Built for collaboration
              </div>
            </div>
  
            {/* Mock board card */}
            <div className="flex items-center justify-center md:justify-end">
              <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-2xl">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-medium text-zinc-200">Sprint Board</div>
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    <span className="h-2 w-2 rounded-full bg-zinc-500" />
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
                    <span className="text-zinc-200">Create team workspace</span>
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">in‑progress</span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
                    <span className="text-zinc-200">Set up task board</span>
                    <span className="rounded-md bg-zinc-700/60 px-2 py-0.5 text-xs text-zinc-300">todo</span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
                    <span className="text-zinc-200">Invite teammates</span>
                    <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-xs text-violet-400">review</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
  
        {/* Features */}
        <section id="features" className="w-full max-w-none px-6 pb-20 md:px-10">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Boards & Lists",
                desc: "Organize work with drag‑and‑drop boards.",
              },
              {
                title: "Team Collaboration",
                desc: "Assign tasks, add comments, and track progress in real time.",
              },
              {
                title: "Minimal Design",
                desc: "Dark, clean, and distraction‑free interface.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"
              >
                <h3 className="text-base font-semibold text-zinc-100">{f.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
  
        {/* Footer */}
        <footer className="border-t border-zinc-800/80">
          <div className="flex w-full max-w-none items-center justify-between px-6 py-8 text-xs text-zinc-500 md:px-10">
            <span>© {new Date().getFullYear()} CollabTasks </span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-zinc-300">Privacy</a>
              <a href="#" className="hover:text-zinc-300">Terms</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }
  