import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AIVoiceAssistant from "../common/AIVoiceAssistant";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <main className="main-content">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <div className="page-content">
          <Outlet />
        </div>

        {/* AI Voice Assistant */}
        <AIVoiceAssistant />
      </main>
    </div>
  );
}

export default Layout;