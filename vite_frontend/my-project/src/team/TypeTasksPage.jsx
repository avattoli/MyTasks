import React, { useEffect, useMemo, useState } from "react";

export default function TypeTasksPage({ team, type, title }) {
  const slug = team?.slug || team?.name;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(""); // '', 'todo', 'in_progress', 'done'
  const [search, setSearch] = useState("");

  const load = async () => {
    if (!slug) return;
    setLoading(true); setError("");
    try {
      const q = new URLSearchParams();
      q.set("type", type);
      if (status) q.set("status", status);
      const res = await fetch(`http://localhost:3000/teams/${encodeURIComponent(slug)}/tasks?${q.toString()}` , { credentials: 'include' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to load (${res.status})`);
      const arr = Array.isArray(body.tasks) ? body.tasks : [];
      arr.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setItems(arr);
    } catch (e) { setError(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [slug, type, status]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(t => t.title?.toLowerCase().includes(term));
  }, [items, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-neutral-400">
          {title || type.charAt(0).toUpperCase() + type.slice(1)} · {items.length} item{items.length === 1 ? '' : 's'}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={status} onChange={(e)=>setStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm">
            <option value="">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search title" className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm" />
          <button onClick={load} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm">Refresh</button>
        </div>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
          <div className="p-4 text-sm text-neutral-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-neutral-400">No items found.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {filtered.map((t) => (
              <li key={t._id} className="p-3 flex items-center gap-3">
                <div className="grow min-w-0">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs text-neutral-400">{t.type} · {t.status} · {t.priority}</div>
                </div>
                <div className="text-xs text-neutral-500">{new Date(t.createdAt).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

