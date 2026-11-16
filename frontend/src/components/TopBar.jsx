import { Link } from "react-router-dom";

export default function TopBar({ project }) {
  return (
    <header className="top-bar">
      <Link to="/" className="brand">
        <span className="brand-icon">*</span>
        GameSmith
      </Link>

      <span className="project-title">
        {project?.title || "Untitled Project"}
      </span>

      <Link to="/projects" className="projects-link">
        All Projects
      </Link>
    </header>
  );
}
