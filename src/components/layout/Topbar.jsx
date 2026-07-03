import { Menu, MapPin, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import policeLogo from "../../assets/police-logo.png";

function Topbar({ setSidebarOpen }) {
  const { i18n } = useTranslation();

  return (
    <header className="topbar">
      <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
        <Menu size={22} />
      </button>

      <div className="topbar-title">
        <img
          src={policeLogo}
          className="topbar-logo"
          alt="Police Logo"
        />

        <div>
          <span className="topbar-kicker">
            Maharashtra Police
          </span>

          <h1>
            छावणी पोलिस स्टेशन
          </h1>

          <p>
            मालेगाव City
          </p>

          <div className="mobile-location-chip">
            <MapPin size={12} />
            <span>Live City Monitoring</span>
          </div>
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