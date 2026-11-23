import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { mockProjectList } from "../api/mockData";
import "../styles/layout/topbar.css";
import "../styles/pages/project-list.css";

//swap for client.js later
function fetchProjects() {
  return Promise.resolve(structuredClone(mockProjectList));
}

const FALLBACK_ERROR = "We couldn't load your projects. Please try again.";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric"
});

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date);
}

function timestamp(project) {
  const time = new Date(project.updated_at ?? project.created_at).getTime();
  return Number.isNaN(time) ? 0 : time;
}

// A project is created with only original_idea; concept fields stay null
// until POST /projects/{id}/concept runs.
function hasConcept(project) {
  return Boolean(project.title || project.premise);
}

function projectStatus(project) {
  if (!hasConcept(project)) return { key: "draft", label: "Concept pending" };
  if (project.current_scene_id == null) return { key: "ready", label: "No scenes yet" };
  return { key: "active", label: "In progress" };
}

function ProjectCard({ project }) {
  const concept = hasConcept(project);
  const status = projectStatus(project);
  const updated = formatDate(project.updated_at ?? project.created_at);
  const tags = [project.genre, project.tone].filter(Boolean);
  const summary = concept ? project.premise : project.original_idea;

  return (
    <li className="project-card">
      <Link to={`/projects/${project.id}`} className="project-card-link">
        <div className="project-card-header">
          <span className={`project-status project-status-${status.key}`}>
            {status.label}
          </span>
          {updated && (
            <time className="project-card-date" dateTime={project.updated_at ?? project.created_at}>
              {updated}
            </time>
          )}
        </div>

        <h2 className={`project-card-title${concept ? "" : " is-untitled"}`}>
          {project.title || "Untitled project"}
        </h2>

        {summary && (
          <p className="project-card-summary">
            {!concept && <span className="detail-label">Original idea</span>}
            {summary}
          </p>
        )}

        {tags.length > 0 && (
          <ul className="project-card-tags" aria-label="Genre and tone">
            {tags.map((tag) => (
              <li key={tag} className="project-tag">{tag}</li>
            ))}
          </ul>
        )}

        <span className="project-card-cta" aria-hidden="true">
          {status.key === "active" ? "Continue story" : "Open workspace"} →
        </span>
      </Link>
    </li>
  );
}

export default function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bumped by "Try again" to re-run the load effect.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    fetchProjects()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data?.projects) ? data.projects : [];
        setProjects([...list].sort((a, b) => timestamp(b) - timestamp(a)));
      })
      .catch((err) => {
        if (!active) return;
        // Contract errors are { error, message }; message is safe to show.
        setError(typeof err?.message === "string" && err.message ? err.message : FALLBACK_ERROR);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  function handleRetry() {
    setLoading(true);
    setError("");
    setAttempt((n) => n + 1);
  }

  let content;
  if (loading) {
    content = (
      <div className="project-list-state" role="status" aria-live="polite">
        <span className="project-list-spinner" aria-hidden="true" />
        <p>Loading your projects…</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="project-list-state" role="alert">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button type="button" className="project-list-button" onClick={handleRetry}>
          Try again
        </button>
      </div>
    );
  } else if (projects.length === 0) {
    content = (
      <div className="project-list-state">
        <h2>No projects yet</h2>
        <p>Every world starts with a single idea. Write yours down and GameSmith will build from there.</p>
        <Link to="/" className="project-list-button project-list-button-primary">
          Start your first project
        </Link>
      </div>
    );
  } else {
    content = (
      <ul className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </ul>
    );
  }

  return (
    <div className="project-list-page">
      <header className="top-bar project-list-topbar">
        <Link to="/" className="brand" aria-label="GameSmith home">
          <span className="brand-icon" aria-hidden="true">G</span>
          GameSmith
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/" className="projects-link">New Project</Link>
        </nav>
      </header>

      <main className="project-list-main" aria-busy={loading}>
        <div className="project-list-heading">
          <div>
            <span className="panel-label">LIBRARY</span>
            <h1>Your projects</h1>
            {!loading && !error && projects.length > 0 && (
              <p className="project-list-count">
                {projects.length} {projects.length === 1 ? "project" : "projects"}, most recent first
              </p>
            )}
          </div>
          {!loading && !error && projects.length > 0 && (
            <Link to="/" className="project-list-button project-list-button-primary">
              + New project
            </Link>
          )}
        </div>

        {content}
      </main>
    </div>
  );
}