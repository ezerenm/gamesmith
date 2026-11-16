import { Link } from "react-router-dom";
import IdeaForm from "../components/IdeaForm";
import "../styles/layout/topbar.css";
import "../styles/pages/landing.css";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="top-bar landing-header">
        <Link to="/" className="brand" aria-label="GameSmith home">
          <span className="brand-icon" aria-hidden="true">G</span>
          GameSmith
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/projects" className="projects-link">All Projects</Link>
        </nav>
      </header>

      <main className="landing-main">
        <div className="landing-home">
          <h1>What game will you create?</h1>
          <p className="landing-subtitle">Start with an idea. Build the world from there.</p>
          <IdeaForm />
        </div>
      </main>
    </div>
  );
}
