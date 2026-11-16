import { Link } from "react-router-dom";

import "../styles/layout/topbar.css";

export default function TopBar({ project }) {
  return (
    <header className="top-bar">
      <Link to="/" className="brand">
        <span className="brand-icon" aria-hidden="true">G</span>
        GameSmith
      </Link>

      <div className="project-context">
        <span className="project-context-label">Narrative workspace</span>
        <span className="project-title">
        {project?.title || "Untitled Project"}
        </span>
      </div>

      <Link to="/projects" className="projects-link">
        All Projects
      </Link>
    </header>
  );
}
