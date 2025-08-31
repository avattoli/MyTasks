import React, { useEffect, useRef, useState } from "react";
import Modal from "../components/Modal";
import { apiFetch } from "../api";

export default function SprintBoard({ team, sprint, onClose }) {
  const slug = team?.slug || team?.name;
  const sprintId = sprint?._id;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [backlog, setBacklog] = useState([]);

  const load = async () => {
    if (!slug || !sprintId) return;
    setLoading(true); setError("");
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/sprints/${encodeURIComponent(sprintId)}/tasks`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to load (${res.status})`);
      setTasks(Array.isArray(body.tasks) ? body.tasks : []);
    } catch (e) { setError(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [slug, sprintId]);

  const byStatus = (s) => tasks.filter(t => t.status === s);

  const updateStatus = async (id, status) => {
    if (!slug) return;
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status } : t));
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/tasks/${encodeURIComponent(id)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to move (${res.status})`);
      const updated = body; setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
    } catch (e) { console.error(e); }
  };

  const removeFromSprint = async (id) => {
    if (!slug || !sprintId) return;
    setTasks(prev => prev.filter(t => t._id !== id));
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/sprints/${encodeURIComponent(sprintId)}/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error || `Failed to remove (${res.status})`);
      }
    } catch (e) { alert(e.message); load(); }
  };

  const openPicker = async () => {
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/tasks?status=todo`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to load backlog (${res.status})`);
      const arr = Array.isArray(body.tasks) ? body.tasks : [];
      const inSprintIds = new Set(tasks.map(t => String(t._id)));
      setBacklog(arr.filter(t => !inSprintIds.has(String(t._id))));
      setPickerOpen(true);
    } catch (e) { alert(e.message); }
  };

  const addToSprint = async (task) => {
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/sprints/${encodeURIComponent(sprintId)}/tasks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task._id })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to add (${res.status})`);
      setTasks(prev => [{ ...task }, ...prev]);
      setBacklog(prev => prev.filter(b => b._id !== task._id));
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">Sprint: {sprint?.name} · {tasks.length} item{tasks.length === 1 ? '' : 's'}</div>
        <div className="flex items-center gap-2">
          <button onClick={openPicker} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm">Add from backlog</button>
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm">Close</button>
        </div>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <SprintColumn title="To Do" status="todo" tasks={byStatus('todo')} onDropCard={(id)=>updateStatus(id,'todo')} onRemove={removeFromSprint} />
        <SprintColumn title="In Progress" status="in_progress" tasks={byStatus('in_progress')} onDropCard={(id)=>updateStatus(id,'in_progress')} onRemove={removeFromSprint} />
        <SprintColumn title="Done" status="done" tasks={byStatus('done')} onDropCard={(id)=>updateStatus(id,'done')} onRemove={removeFromSprint} />
      </div>

      {pickerOpen && (
        <Modal title="Add tasks to sprint" onClose={() => setPickerOpen(false)}>
          <div className="space-y-3">
            {backlog.length === 0 ? (
              <div className="text-sm text-neutral-400">No backlog items available.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {backlog.map(item => (
                  <li key={item._id} className="py-2 flex items-center gap-3">
                    <div className="grow min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-xs text-neutral-400">{item.type || 'task'} · {item.priority || 'medium'}</div>
                    </div>
                    <button onClick={() => addToSprint(item)} className="px-2 py-1 rounded-lg bg-white text-neutral-900 text-sm">Add</button>
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

function SprintColumn({ title, status, tasks, onDropCard, onRemove }) {
  const colRef = useRef(null);
  const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; colRef.current?.classList.add("ring-1","ring-white/30"); };
  const onDragLeave = () => colRef.current?.classList.remove("ring-1","ring-white/30");
  const onDrop = (e) => { e.preventDefault(); onDragLeave(); const id = e.dataTransfer.getData("text/plain"); if (id) onDropCard(id); };

  return (
    <div ref={colRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className="rounded-2xl border border-white/10 bg-white/5 p-3 min-h-[340px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-neutral-400">{tasks.length}</span>
      </div>
      <div className="space-y-2">
        {tasks.map((t) => (
          <SprintCard key={t._id} task={t} onRemove={() => onRemove(t._id)} />
        ))}
      </div>
    </div>
  );
}

function SprintCard({ task, onRemove }) {
  const ref = useRef(null);
  const onDragStart = (e) => { e.dataTransfer.setData("text/plain", task._id); e.dataTransfer.effectAllowed = "move"; setTimeout(()=>ref.current?.classList.add("opacity-50"), 0); };
  const onDragEnd = () => ref.current?.classList.remove("opacity-50");

  return (
    <div ref={ref} draggable onDragStart={onDragStart} onDragEnd={onDragEnd} className="rounded-xl border border-white/10 bg-neutral-900 p-3 text-sm flex items-start justify-between gap-2">
      <div className="leading-tight">
        <div className="font-medium text-neutral-100 break-words">{task.title}</div>
      </div>
      <button onClick={onRemove} className="shrink-0 h-6 w-6 grid place-items-center rounded-lg hover:bg-white/10 text-neutral-400" title="Remove from sprint">✕</button>
    </div>
  );
}
