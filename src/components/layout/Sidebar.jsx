import { NavLink, useNavigate } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Landmark,
  PlusCircle,
  CalendarCheck,
  Map,
  BarChart3,
  FileText,
  Users,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/useAuth";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <aside className={`sidebar ${sidebarOpen ? "show-sidebar" : ""}`}>
      <div className="brand">
        <div className="brand-icon">
          <Shield size={28} />
        </div>
        <div>
          <h2>{t("appName")}</h2>
          <p>Police Command Center</p>
        </div>
      </div>

      <nav className="nav-menu">
        <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)}>
          <LayoutDashboard size={19} /> {t("dashboard")}
        </NavLink>

        <p className="nav-label">Religious Places</p>

        <NavLink to="/add-religious-place" onClick={() => setSidebarOpen(false)}>
          <PlusCircle size={19} /> {t("addReligiousPlace")}
        </NavLink>

        <NavLink to="/religious-places" onClick={() => setSidebarOpen(false)}>
          <Landmark size={19} /> {t("religiousPlaces")}
        </NavLink>

        <p className="nav-label">Festival Permissions</p>

        <NavLink to="/add-festival-permission" onClick={() => setSidebarOpen(false)}>
          <PlusCircle size={19} /> {t("addFestivalPermission")}
        </NavLink>

        <NavLink to="/festival-permissions" onClick={() => setSidebarOpen(false)}>
          <CalendarCheck size={19} /> {t("festivalPermissions")}
        </NavLink>

        <p className="nav-label">Monitoring</p>

        <NavLink to="/map-view" onClick={() => setSidebarOpen(false)}>
          <Map size={19} /> {t("mapView")}
        </NavLink>

        <NavLink to="/reports" onClick={() => setSidebarOpen(false)}>
          <FileText size={19} /> Reports
        </NavLink>

        <NavLink to="/analytics" onClick={() => setSidebarOpen(false)}>
          <BarChart3 size={19} /> Analytics
        </NavLink>

        <NavLink to="/officers" onClick={() => setSidebarOpen(false)}>
          <Users size={19} /> Officers
        </NavLink>

        <NavLink to="/police-stations" onClick={() => setSidebarOpen(false)}>
          <Building2 size={19} /> Police Stations
        </NavLink>

        <NavLink to="/settings" onClick={() => setSidebarOpen(false)}>
          <Settings size={19} /> Settings
        </NavLink>
      </nav>

      <button
        className="logout-btn"
        onClick={() => {
          logout();
          setSidebarOpen(false);
          navigate("/");
        }}
      >
        <LogOut size={19} />
        {t("logout")}
      </button>
    </aside>
  );
}

export default Sidebar;