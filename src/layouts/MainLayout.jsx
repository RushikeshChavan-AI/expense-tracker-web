import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage("sidebar-collapsed", false);

  return (
    <div className="relative flex min-h-screen bg-bg">
      <div className="ambient-blob left-[-10%] top-[-10%] h-96 w-96 bg-gold/10" />
      <div className="ambient-blob bottom-[-10%] right-[-10%] h-96 w-96 bg-violet/10" />

      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />

      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
