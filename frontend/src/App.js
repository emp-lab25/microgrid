import { useState } from "react";
import './Theme.css';
import Production from './pages/Production';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  const [currentPage, setCurrentPage] = useState("production");

  return (
    <div className="App" style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />

        {/* Dashboard Content */}
        <main style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
          {currentPage === "production" && <Production />}
          {currentPage !== "production" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <p style={{ color: "var(--muted-foreground)", fontSize: "1.125rem" }}>
                Page {currentPage} en développement...
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
