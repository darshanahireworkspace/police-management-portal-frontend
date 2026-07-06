import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Languages,
  Moon,
  Database,
  Lock,
  MapPin,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";

const DEFAULT_SETTINGS = {
  systemName: "Police City Religious & Festival Intelligence Management System",
  cityName: "Malegaon",
  district: "Nashik",
  state: "Maharashtra",
  defaultLanguage: "mr",
  themeMode: "light",
  enableNotifications: "Yes",
  enableGpsTracking: "Yes",
  enableDuplicateCheck: "Yes",
  enableAuditLogs: "Yes",
  autoLogout: "30",
};

function Settings() {
  const { officer } = useAuth();
  const { i18n } = useTranslation();

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("policeAppSettings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    applyTheme(settings.themeMode);
    i18n.changeLanguage(settings.defaultLanguage);
  }, []);

  const applyTheme = (mode) => {
    const root = document.documentElement;

    if (mode === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (mode === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", dark ? "dark" : "light");
    }

    localStorage.setItem("theme", mode);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = {
      ...settings,
      [name]: value,
    };

    setSettings(updated);

    if (name === "themeMode") {
      applyTheme(value);
      toast.success("Theme updated");
    }

    if (name === "defaultLanguage") {
      i18n.changeLanguage(value);
      toast.success("Language updated");
    }

    localStorage.setItem("policeAppSettings", JSON.stringify(updated));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("policeAppSettings", JSON.stringify(settings));
    toast.success("Settings saved successfully");
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">System Settings</h2>
          <p className="page-subtitle">
            Manage application preferences, security, language, GPS and system controls.
          </p>
        </div>
      </div>

      <form className="settings-layout" onSubmit={handleSave}>
        <section className="settings-profile-card">
          <div className="settings-avatar">
            <Shield size={34} />
          </div>

          <h3>{officer?.full_name || "Police Officer"}</h3>
          <p>{officer?.role || "Officer"}</p>

          <div className="settings-profile-info">
            <span>Username</span>
            <b>{officer?.username || "-"}</b>
          </div>

          <div className="settings-profile-info">
            <span>Police Station</span>
            <b>{officer?.police_station || "-"}</b>
          </div>
        </section>

        <div className="settings-main">
          <section className="form-section">
            <div className="section-title">
              <SettingsIcon size={20} />
              <h3>Application Settings</h3>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>System Name</label>
                <input name="systemName" value={settings.systemName} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>City</label>
                <input name="cityName" value={settings.cityName} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>District</label>
                <input name="district" value={settings.district} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>State</label>
                <input name="state" value={settings.state} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Auto Logout Time</label>
                <select name="autoLogout" value={settings.autoLogout} onChange={handleChange}>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                  <option value="120">2 Hours</option>
                </select>
              </div>
            </div>
          </section>

          <section className="settings-grid">
            <div className="settings-card">
              <Languages size={22} />
              <div>
                <h4>Language</h4>
                <select name="defaultLanguage" value={settings.defaultLanguage} onChange={handleChange}>
                  <option value="mr">मराठी</option>
                  <option value="hi">हिंदी</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="settings-card">
              <Moon size={22} />
              <div>
                <h4>Theme Mode</h4>
                <select name="themeMode" value={settings.themeMode} onChange={handleChange}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
            </div>

            <div className="settings-card">
              <Bell size={22} />
              <div>
                <h4>Notifications</h4>
                <select name="enableNotifications" value={settings.enableNotifications} onChange={handleChange}>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>

            <div className="settings-card">
              <MapPin size={22} />
              <div>
                <h4>GPS Tracking</h4>
                <select name="enableGpsTracking" value={settings.enableGpsTracking} onChange={handleChange}>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>

            <div className="settings-card">
              <Database size={22} />
              <div>
                <h4>Duplicate Check</h4>
                <select name="enableDuplicateCheck" value={settings.enableDuplicateCheck} onChange={handleChange}>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>

            <div className="settings-card">
              <Lock size={22} />
              <div>
                <h4>Audit Logs</h4>
                <select name="enableAuditLogs" value={settings.enableAuditLogs} onChange={handleChange}>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <User size={20} />
              <h3>Security Preferences</h3>
            </div>

            <div className="settings-security-list">
              <div><b>JWT Login Security</b><span>Enabled</span></div>
              <div><b>Role Based Access</b><span>Enabled</span></div>
              <div><b>Password Encryption</b><span>Enabled</span></div>
              <div><b>Protected Routes</b><span>Enabled</span></div>
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" className="primary-btn">
              <Save size={18} />
              Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Settings;