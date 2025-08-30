import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import SprintBoard from "./SprintBoard";

export default function SprintsPage({ team }) {
  const slug = team?.slug || team?.name;
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", goal: "", startDate: "", endDate: "" });
  const [openBoardFor, setOpenBoardFor] = useState(null);

  const load = async () => {
    if (!slug) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`http://localhost:3000/teams/${encodeURIComponent(slug)}/sprints`, { credentials: 'include' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to load (${res.status})`);
      setSprints(Array.isArray(body.sprints) ? body.sprints : []);
    } catch (e) { setError(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [slug]);

  const createSprint = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/teams/${encodeURIComponent(slug)}/sprints`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ name: form.name, goal: form.goal, startDate: form.startDate || undefined, endDate: form.endDate || undefined })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to create (${res.status})`);
      setSprints((prev) => [body, ...prev]);
      setOpen(false); setForm({ name: "", goal: "", startDate: "", endDate: "" });
    } catch (e) { alert(e.message); }
  };

  const update = async (id, patch) => {
    try {
      const res = await fetch(`http://localhost:3000/teams/${encodeURIComponent(slug)}/sprints/${encodeURIComponent(id)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(patch)
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to update (${res.status})`);
      setSprints((prev) => prev.map(s => s._id === id ? body : s));
    } catch (e) { alert(e.message); }
  };

  const remove = async (id) => {
    const prev = sprints;
    setSprints((p) => p.filter(s => s._id !== id));
    try {
      const res = await fetch(`http://localhost:3000/teams/${encodeURIComponent(slug)}/sprints/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok && res.status !== 204) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error || `Failed to delete (${res.status})`);
      }
    } catch (e) { alert(e.message); setSprints(prev); }
  };

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString() : '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">{sprints.length} sprint{sprints.length === 1 ? '' : 's'}</div>
        <button onClick={() => setOpen(true)} className="px-3 py-2 rounded-xl bg-white text-neutral-900 text-sm font-medium">Create sprint</button>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
          <div className="p-4 text-sm text-neutral-400">Loading…</div>
        ) : sprints.length === 0 ? (
          <div className="p-4 text-sm text-neutral-400">No sprints yet.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {sprints.map((s) => (
              <li key={s._id} className="p-3 flex items-center gap-3">
                <div className="grow min-w-0">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-xs text-neutral-400">{s.status || 'planned'} · {formatDate(s.startDate)} → {formatDate(s.endDate)}</div>
                  {s.goal && <div className="text-xs text-neutral-400 mt-1 truncate">Goal: {s.goal}</div>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setOpenBoardFor(s)} className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm">Open board</button>
                  {s.status !== 'active' && <button onClick={() => update(s._id, { status: 'active' })} className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm">Start</button>}
                  {s.status !== 'completed' && <button onClick={() => update(s._id, { status: 'completed' })} className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm">Complete</button>}
                  <button onClick={() => remove(s._id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10" title="Delete">✕</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <Modal title="Create sprint" onClose={() => setOpen(false)}>
          <form onSubmit={createSprint} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input value={form.name} onChange={(e)=>setForm(f=>({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10" />
            </div>
            <div>
              <label className="block text-sm mb-1">Goal (optional)</label>
              <input value={form.goal} onChange={(e)=>setForm(f=>({ ...f, goal: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Start date</label>
                <input type="date" value={form.startDate} onChange={(e)=>setForm(f=>({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10" />
              </div>
              <div>
                <label className="block text-sm mb-1">End date</label>
                <input type="date" value={form.endDate} onChange={(e)=>setForm(f=>({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15">Cancel</button>
              <button type="submit" className="px-3 py-2 rounded-xl bg-white text-neutral-900 font-medium">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {openBoardFor && (
        <Modal title={`Sprint board — ${openBoardFor.name}`} onClose={() => setOpenBoardFor(null)}>
          <div className="-m-4">
            <div className="p-1">
              <SprintBoard team={team} sprint={openBoardFor} onClose={() => setOpenBoardFor(null)} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
