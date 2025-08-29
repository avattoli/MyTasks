import React, { useEffect, useMemo, useState } from "react";

/**
 * Teams Dashboard (Frontend-only, no fetch/logic)
 *
 * Pass data and callbacks via props. This file contains ONLY UI.
 * You own the data loading/mutations outside.
 *
 * Props:
 *   user?: { name?: string; email?: string }
 *   teams?: Array<{ _id: string; name: string; slug?: string; leaderId?: string; joinCode?: string; members?: Array<{ userId: string; role?: string }> ; createdAt?: string }>
 *   onCreateTeam?: (name: string) => void
 *   onJoinTeam?: (code: string) => void
 *   onRefresh?: () => void
 *   onOpenTeam?: (team: any) => void   // navigate/open handler
 */

export default function Dashboard({ user, onCreateTeam, onJoinTeam, onRefresh, onOpenTeam }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [teams, setTeams] =  useState([]);

  
    const handleOnCreate = async (e) => {
    e.preventDefault()
    const teamName = createName.trim();
    if (!teamName) {
        console.log("Entered empty team name");
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/teams/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // important if you’re using cookies for auth
          body: JSON.stringify({ teamName })
        });
    
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create team");
        }
    
        const newTeam = await res.json();
        console.log("Created team:", newTeam);
    
        // TODO: update your local state so the new team shows in the dashboard
        setTeams((prev) => [newTeam, ...prev]);
      } catch (err) {
        console.error(err);
        alert(err.message); // or set an error state instead of alert
      }

  }
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Top Bar */}
      <header className="border-b border-white/10 sticky top-0 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70 bg-neutral-950/90 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-400 text-neutral-900 grid place-items-center font-bold">T</div>
            <div>
              <div className="text-sm text-neutral-400">Welcome</div>
              <div className="font-medium leading-tight">{user?.name || user?.email || "User"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setJoinOpen(true)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm">Join team</button>
            <button onClick={() => setCreateOpen(true)} className="px-3 py-2 rounded-xl bg-white text-neutral-900 font-medium text-sm hover:opacity-90">Create team</button>
          </div>
        </div>
      </header>

      {/* Teams Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your teams</h2>
          <button onClick={onRefresh} className="text-sm px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5">Refresh</button>
        </div>

        {teams.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} onJoin={() => setJoinOpen(true)} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((t) => (
              <TeamCard key={t._id} team={t} onOpen={() => onOpenTeam?.(t)} />
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {createOpen && (
        <Modal title="Create a team" onClose={() => setCreateOpen(false)}>
          <form onSubmit={handleOnCreate} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Team name</label>
              <input value={createName} onChange={(e) => setCreateName(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="Acme Corp" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setCreateOpen(false)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15">Cancel</button>
              <button type="submit" className="px-3 py-2 rounded-xl bg-white text-neutral-900 font-medium">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Join Modal */}
      {joinOpen && (
        <Modal title="Join a team" onClose={() => setJoinOpen(false)}>
          <form onSubmit={(e)=>{e.preventDefault(); onJoinTeam?.(joinCode.trim()); setJoinCode(""); setJoinOpen(false);}} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Join code</label>
              <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="ABC123" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setJoinOpen(false)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15">Cancel</button>
              <button type="submit" className="px-3 py-2 rounded-xl bg-white text-neutral-900 font-medium">Join</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// -------------------- UI Pieces --------------------
function TeamCard({ team, onOpen }) {
  const created = useMemo(() => new Date(team.createdAt || Date.now()).toLocaleDateString(), [team.createdAt]);
  const count = 1 + (Array.isArray(team.members) ? team.members.length : 0);

  return (
    <button onClick={onOpen} className="text-left block w-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 hover:border-white/20 hover:from-white/10 transition">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold leading-tight truncate">{team.name}</h3>
          <div className="text-xs text-neutral-400">Created {created}</div>
        </div>
        <div className="px-2 py-1 rounded-lg bg-white/10 text-xs">{count} member{count !== 1 ? "s" : ""}</div>
      </div>
      <div className="mt-3 text-sm text-neutral-300 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 rounded-full bg-white/15 items-center justify-center text-[10px]">👑</span>
        <span>Leader ID: <code className="text-neutral-200">{String(team.leaderId || "—").slice(0, 6)}{team.leaderId ? "…" : ""}</code></span>
      </div>
      {team.joinCode && (
        <div className="mt-3 text-xs text-neutral-400">Join code: <span className="font-mono text-neutral-200">{team.joinCode}</span></div>
      )}
    </button>
  );
}

function EmptyState({ onCreate, onJoin }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 grid place-items-center text-center">
      <div className="max-w-md space-y-4">
        <h3 className="text-xl font-semibold">No teams yet</h3>
        <p className="text-neutral-400">Create a team and become its leader, or join one with a code someone shared with you.</p>
        <div className="flex items-center justify-center gap-2">
          <button onClick={onJoin} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20">Join team</button>
          <button onClick={onCreate} className="px-3 py-2 rounded-xl bg-white text-neutral-900 font-medium">Create team</button>
        </div>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10">✕</button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
