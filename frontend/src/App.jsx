import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import ProjectListPage from "./pages/ProjectListPage";
import WorkspacePage from "./pages/WorkspacePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/:id" element={<WorkspacePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;