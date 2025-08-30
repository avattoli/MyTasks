import React, { useEffect, useState } from "react";

export default function MembersPage({ team }) {
  const slug = team?.slug || team?.name;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!slug) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`http://localhost:3000/teams/${encodeURIComponent(slug)}/members`, { credentials: 'include' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to load (${res.status})`);
      setData(body.team);
    } catch (e) { setError(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [slug]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">Team members</div>
        <button onClick={load} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm">Refresh</button>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      {!data || loading ? (
        <div className="p-4 text-sm text-neutral-400">Loading…</div>
      ) : (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-neutral-400 mb-1">Leader</div>
            <MemberRow user={data.leader} role="ADMIN" status="ACTIVE" leader />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5">
            {(!data.members || data.members.length === 0) ? (
              <div className="p-4 text-sm text-neutral-400">No members yet.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {data.members.map((m, idx) => (
                  <li key={(m.user?._id || idx)} className="p-3">
                    <MemberRow user={m.user} role={m.role} status={m.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MemberRow({ user, role, status, leader }) {
  const initials = (user?.username || user?.email || "?").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-xl bg-white/10 grid place-items-center text-sm">{initials}</div>
        <div className="min-w-0">
          <div className="font-medium truncate">{user?.username || user?.email || user?._id || "Unknown"}</div>
          {user?.email && <div className="text-xs text-neutral-400 truncate">{user.email}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 rounded-lg bg-white/10">{leader ? 'LEADER' : role}</span>
        <span className="px-2 py-1 rounded-lg bg-white/10">{status}</span>
      </div>
    </div>
  );
}

