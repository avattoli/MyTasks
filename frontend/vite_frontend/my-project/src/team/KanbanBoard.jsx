import React, { useEffect, useRef, useState } from "react";
import Modal from "../components/Modal";
import { apiFetch } from "../api";

export default function KanbanBoard({ team }) {
  const slug = team?.slug || team?.name;
  const [cards, setCards] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [board, setBoard] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [backlogOpen, setBacklogOpen] = useState(false);
  const [backlogItems, setBacklogItems] = useState([]);
  const [maxTasksInput, setMaxTasksInput] = useState(4);
  const [colLimits, setColLimits] = useState({});

  // Load tasks for this team
  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/tasks`);
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error || `Failed to load tasks (${res.status})`);
        setCards(Array.isArray(body.tasks) ? body.tasks : []);
      } catch (e) {
        setError(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Load / create board
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/board`);
        if (res.status === 404) { setBoard(null); return; }
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error || `Failed to load board (${res.status})`);
        const b = body.board;
        setBoard(b);
        setMaxTasksInput(b?.maxTasks ?? 4);
        const limits = {};
        (b?.columns || []).forEach(c => { limits[c.key] = c.wipLimit ?? ''; });
        setColLimits(limits);
      } catch (e) { console.error(e); }
    })();
  }, [slug]);

  const addCard = async (e) => {
    e?.preventDefault?.();
    const t = title.trim();
    if (!t || !slug) return;
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, status: "todo", labels: ["board"] }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to create (${res.status})`);
      const created = body;
      setCards((prev) => [created, ...prev]);
      setTitle("");
    } catch (e) { alert(e.message); }
  };

  const updateStatus = async (id, status) => {
    if (!slug) return;
    setCards((prev) => prev.map((c) => (c._id === id ? { ...c, status } : c)));
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/tasks/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to move (${res.status})`);
      const updated = body;
      setCards((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (e) { console.error(e); }
  };

  const removeCard = async (id) => {
    if (!slug) return;
    setCards((prev) => prev.filter((c) => c._id !== id));
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/tasks/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Failed to delete (${res.status})`);
      }
    } catch (e) { alert(e.message); }
  };

  const byStatus = (s) => cards.filter((c) => c.status === s && Array.isArray(c.labels) && c.labels.includes("board"));

  // Load backlog items not on board
  const openBacklogPicker = async () => {
    try {
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/tasks?status=todo`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to load backlog (${res.status})`);
      const all = Array.isArray(body.tasks) ? body.tasks : [];
      const notOnBoard = all.filter(t => !Array.isArray(t.labels) || !t.labels.includes('board'));
      setBacklogItems(notOnBoard);
      setBacklogOpen(true);
    } catch (e) { alert(e.message); }
  };

  const addFromBacklog = async (task) => {
    try {
      const labels = Array.isArray(task.labels) ? Array.from(new Set([...task.labels, 'board'])) : ['board'];
      const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/tasks/${encodeURIComponent(task._id)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labels })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Failed to add to board (${res.status})`);
      const updated = body;
      // add to cards locally
      setCards((prev) => [updated, ...prev.filter(c => c._id !== updated._id)]);
      setBacklogItems((prev) => prev.filter(b => b._id !== updated._id));
    } catch (e) { alert(e.message); }
  };

  const boardCount = cards.filter(c => Array.isArray(c.labels) && c.labels.includes('board')).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          {boardCount} {boardCount === 1 ? 'card on board' : 'cards on board'}{board?.maxTasks ? ` · max ${board.maxTasks}` : ''}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openBacklogPicker} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm">Add from backlog</button>
          {board ? (
            <button onClick={() => setSettingsOpen(true)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm">Board settings</button>
          ) : (
            <button onClick={async () => {
              try {
                const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/board`, { method: 'POST' });
                const body = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(body?.error || `Failed to create board (${res.status})`);
                setBoard(body.board);
                setMaxTasksInput(body.board?.maxTasks ?? 4);
                const limits = {};
                (body.board?.columns || []).forEach(c => { limits[c.key] = c.wipLimit ?? ''; });
                setColLimits(limits);
              } catch (e) { alert(e.message); }
            }} className="px-3 py-2 rounded-xl bg-white text-neutral-900 text-sm font-medium">Create Kanban board</button>
          )}
        </div>
      </div>

      <form onSubmit={addCard} className="flex items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task and press Enter"
          className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        <button type="submit" className="px-3 py-2 rounded-xl bg-white text-neutral-900 font-medium">Add</button>
      </form>

      <div className="grid gap-3 sm:grid-cols-3">
        <KanbanColumn title="To Do" status="todo" cards={byStatus("todo")} onDropCard={(id) => updateStatus(id, "todo")} onRemove={removeCard} />
        <KanbanColumn title="In Progress" status="in_progress" cards={byStatus("in_progress")} onDropCard={(id) => updateStatus(id, "in_progress")} onRemove={removeCard} />
        <KanbanColumn title="Done" status="done" cards={byStatus("done")} onDropCard={(id) => updateStatus(id, "done")} onRemove={removeCard} />
      </div>

      {/* Backlog Picker Modal */}
      {backlogOpen && (
        <Modal title="Add from backlog" onClose={() => setBacklogOpen(false)}>
          <div className="space-y-3">
            {backlogItems.length === 0 ? (
              <div className="text-sm text-neutral-400">No backlog items available.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {backlogItems.map(item => (
                  <li key={item._id} className="py-2 flex items-center gap-3">
                    <div className="grow min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-xs text-neutral-400">{item.type || 'task'} · {item.priority || 'medium'}</div>
                    </div>
                    <button onClick={() => addFromBacklog(item)} className="px-2 py-1 rounded-lg bg-white text-neutral-900 text-sm">Add</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Modal>
      )}

      {settingsOpen && board && (
        <Modal title="Kanban board settings" onClose={() => setSettingsOpen(false)}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const payload = {
                maxTasks: Number(maxTasksInput),
                columns: (board.columns || []).map(c => ({ key: c.key, wipLimit: colLimits[c.key] === '' ? null : Number(colLimits[c.key]) }))
              };
              const res = await apiFetch(`/teams/${encodeURIComponent(slug)}/board`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              const body = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(body?.error || `Failed to save (${res.status})`);
              setBoard(body.board || body?.board);
              setSettingsOpen(false);
            } catch (e) { alert(e.message); }
          }} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Max tasks on board</label>
              <input type="number" min="0" value={maxTasksInput} onChange={(e) => setMaxTasksInput(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10" />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-neutral-400">Column WIP limits</div>
              {(board.columns || []).map(c => (
                <div key={c.key} className="flex items-center justify-between gap-3">
                  <label className="text-sm w-40">{c.name}</label>
                  <input type="number" min="0" value={colLimits[c.key]} onChange={(e) => setColLimits(s => ({ ...s, [c.key]: e.target.value }))} className="w-32 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setSettingsOpen(false)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15">Cancel</button>
              <button type="submit" className="px-3 py-2 rounded-xl bg-white text-neutral-900 font-medium">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function KanbanColumn({ title, status, cards, onDropCard, onRemove }) {
  const colRef = useRef(null);
  const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; colRef.current?.classList.add("ring-1", "ring-white/30"); };
  const onDragLeave = () => colRef.current?.classList.remove("ring-1", "ring-white/30");
  const onDrop = (e) => { e.preventDefault(); onDragLeave(); const id = e.dataTransfer.getData("text/plain"); if (id) onDropCard(id); };

  return (
    <div ref={colRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className="rounded-2xl border border-white/10 bg-white/5 p-3 min-h-[340px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-neutral-400">{cards.length}</span>
      </div>
      <div className="space-y-2">
        {cards.map((c) => (
          <KanbanCard key={c._id} card={c} onRemove={() => onRemove(c._id)} />
        ))}
      </div>
    </div>
  );
}

function KanbanCard({ card, onRemove }) {
  const ref = useRef(null);
  const onDragStart = (e) => { e.dataTransfer.setData("text/plain", card._id); e.dataTransfer.effectAllowed = "move"; setTimeout(() => ref.current?.classList.add("opacity-50"), 0); };
  const onDragEnd = () => ref.current?.classList.remove("opacity-50");

  return (
    <div ref={ref} draggable onDragStart={onDragStart} onDragEnd={onDragEnd} className="rounded-xl border border-white/10 bg-neutral-900 p-3 text-sm flex items-start justify-between gap-2">
      <div className="leading-tight">
        <div className="font-medium text-neutral-100 break-words">{card.title}</div>
      </div>
      <button onClick={onRemove} className="shrink-0 h-6 w-6 grid place-items-center rounded-lg hover:bg-white/10 text-neutral-400" title="Delete">✕</button>
    </div>
  );
}
