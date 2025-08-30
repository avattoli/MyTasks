import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeamHub from "./team/TeamHub";
import KanbanBoard from "./team/KanbanBoard";
import BacklogList from "./team/BacklogList";
import SprintsPage from "./team/SprintsPage";
import TypeTasksPage from "./team/TypeTasksPage";
import MembersPage from "./team/MembersPage";

export default function TeamDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const team = { name: slug, slug };
  const [section, setSection] = useState("board");

  return (
    <TeamHub team={team} activeSection={section} onBack={() => navigate('/dashboard')} onNavigate={setSection}>
      <h2 className="text-lg font-semibold mb-2 capitalize">{section}</h2>
      <p className="text-neutral-400 text-sm mb-4">This is the <span className="font-mono">{section}</span> view.</p>
      {section === 'board' && <KanbanBoard team={team} />}
      {section === 'backlog' && <BacklogList team={team} />}
      {section === 'sprints' && <SprintsPage team={team} />}
      {section === 'members' && <MembersPage team={team} />}
      {section === 'epics' && <TypeTasksPage team={team} type="epic" title="Epics" />}
      {section === 'stories' && <TypeTasksPage team={team} type="story" title="Stories" />}
      {section === 'tasks' && <TypeTasksPage team={team} type="task" title="Tasks" />}
      {section === 'bugs' && <TypeTasksPage team={team} type="bug" title="Bugs" />}
    </TeamHub>
  );
}
