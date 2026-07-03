import { Menu, MapPin, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

function Topbar({ setSidebarOpen }) {
  const { i18n } = useTranslation();

  return (
    <header className="topbar">
      <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
        <Menu size={22} />
      </button>

      <div className="topbar-title">
        <span className="topbar-kicker">PCRFIMS</span>
        <h1>Police Control</h1>
        <div className="mobile-location-chip">
          <MapPin size={12} />
          <span>Live City Monitoring</span>
        </div>
      </div>

      <div className="topbar-actions mobile-only-actions">
        <div className="language-pill">
          <Languages size={14} />
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="mr">मराठी</option>
            <option value="hi">हिंदी</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </header>
  );
}

export default Topbar;