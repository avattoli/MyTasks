import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { apiFetch } from "../api";

export default function BacklogList({ team }) {
  const slug = team?.slug || team?.name;
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [type, setType] = useState("task");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!slug) return;
    setLoading(true);
    setError("");
    try {
      // Load todo tasks
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/tasks?status=todo`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to load (${res.status})`);
      let arr = Array.isArray(body.tasks) ? body.tasks : [];

      // Load sprints and exclude tasks already assigned to any sprint
      const sRes = await apiFetch(`/teams/${encodeURIComponent(slug)}/sprints`);
      const sBody = await sRes.json().catch(() => ({}));
      const sprintTasks = new Set(
        Array.isArray(sBody?.sprints) ? sBody.sprints.flatMap(sp => (sp.taskIds || []).map(String)) : []
      );

      // Exclude tasks on Kanban (label 'board') or already in a sprint
      arr = arr.filter(t => {
        const onBoard = Array.isArray(t.labels) && t.labels.includes('board');
        const inSprint = sprintTasks.has(String(t._id));
        return !onBoard && !inSprint;
      });

      arr.sort((a,b) => (a.order ?? 0) - (b.order ?? 0) || (new Date(a.createdAt) - new Date(b.createdAt)));
      setItems(arr);
    } catch (e) { setError(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [slug]);

  const add = async (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/tasks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t, status: 'todo', priority, type })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to create (${res.status})`);
      setItems((prev) => [...prev, body].sort((a,b)=> (a.order??0)-(b.order??0)));
      setTitle("");
    } catch (e) { alert(e.message); }
  };

  // Start flow: prompt user to add to board or sprint
  const [startFor, setStartFor] = useState(null); // task object
  const [chooseSprint, setChooseSprint] = useState(false);
  const [sprints, setSprints] = useState([]);

  const openStart = async (task) => {
    setStartFor(task);
    setChooseSprint(false);
  };

  const promoteToBoard = async (id) => {
    try {
      const item = items.find(i => i._id === id);
      const labels = Array.isArray(item?.labels) ? Array.from(new Set([...item.labels, 'board'])) : ['board'];
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/tasks/${encodeURIComponent(id)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'todo', labels })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to add to board (${res.status})`);
      // remove from backlog list (board items hidden by filter)
      setItems((prev) => prev.filter(i => i._id !== id));
      setStartFor(null);
    } catch (e) { alert(e.message); }
  };

  const loadSprints = async () => {
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/sprints`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to load sprints (${res.status})`);
      setSprints(Array.isArray(body.sprints) ? body.sprints : []);
      setChooseSprint(true);
    } catch (e) { alert(e.message); }
  };

  const addToSprint = async (sprintId, taskId) => {
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/sprints/${encodeURIComponent(sprintId)}/tasks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to add to sprint (${res.status})`);
      // Remove from backlog list and close modal
      setItems(prev => prev.filter(i => i._id !== taskId));
      setStartFor(null);
      setChooseSprint(false);
    } catch (e) { alert(e.message); }
  };

  const remove = async (id) => {
    const prev = items;
    setItems((p) => p.filter(i => i._id !== id));
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/tasks/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (!res.ok && res.status !== 204) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error || `Failed to delete (${res.status})`);
      }
    } catch (e) { alert(e.message); setItems(prev); }
  };

  const swap = async (i, j) => {
    if (i < 0 || j < 0 || i >= items.length || j >= items.length) return;
    const a = items[i];
    const b = items[j];
    const newOrderA = b.order ?? j;
    const newOrderB = a.order ?? i;
    const next = items.slice();
    next[i] = b; next[j] = a;
    next[i].order = newOrderA; next[j].order = newOrderB;
    setItems(next);
    try {
      await Promise.all([
        apiFetch(`/teams/${encodeURIComponent(slug)}/tasks/${encodeURIComponent(a._id)}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: newOrderA })
        }),
        apiFetch(`/teams/${encodeURIComponent(slug)}/tasks/${encodeURIComponent(b._id)}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: newOrderB })
        })
      ]);
    } catch (e) { console.error(e); load(); }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="grid gap-2 sm:grid-cols-4">
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Add backlog item" className="sm:col-span-2 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10" />
        <select value={priority} onChange={(e)=>setPriority(e.target.value)} className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/10">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select value={type} onChange={(e)=>setType(e.target.value)} className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/10">
          <option value="task">Task</option>
          <option value="story">Story</option>
          <option value="epic">Epic</option>
          <option value="bug">Bug</option>
        </select>
      </form>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <div className="rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
          <div className="p-4 text-sm text-neutral-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-neutral-400">No backlog items yet.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {items.map((it, idx) => (
              <li key={it._id} className="p-3 flex items-center gap-3">
                <div className="grow min-w-0">
                  <div className="font-medium truncate">{it.title}</div>
                  <div className="text-xs text-neutral-400">{it.type} · {it.priority}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => swap(idx, idx-1)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10" title="Move up">↑</button>
                  <button onClick={() => swap(idx, idx+1)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10" title="Move down">↓</button>
                  <button onClick={() => openStart(it)} className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm">Start</button>
                  <button onClick={() => remove(it._id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10" title="Delete">✕</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {startFor && !chooseSprint && (
        <Modal title="Start task" onClose={() => setStartFor(null)}>
          <div className="space-y-3">
            <div className="text-sm text-neutral-300">Where do you want to start this task?</div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => promoteToBoard(startFor._id)} className="px-3 py-2 rounded-xl bg-white text-neutral-900 text-sm">Add to Kanban</button>
              <button onClick={loadSprints} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm">Add to Sprint</button>
            </div>
          </div>
        </Modal>
      )}

      {startFor && chooseSprint && (
        <Modal title="Add to sprint" onClose={() => { setStartFor(null); setChooseSprint(false); }}>
          <div className="space-y-3">
            {sprints.length === 0 ? (
              <div className="text-sm text-neutral-400">No sprints available.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {sprints.map(sp => (
                  <li key={sp._id} className="py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{sp.name}</div>
                      <div className="text-xs text-neutral-400">{sp.status || 'planned'}</div>
                    </div>
                    <button onClick={() => addToSprint(sp._id, startFor._id)} className="px-2 py-1 rounded-lg bg-white text-neutral-900 text-sm">Add</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
