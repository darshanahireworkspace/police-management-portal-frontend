import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Languages,
  ShieldCheck,
  Download,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { loginOfficerApi } from "../api/authApi";
import useAuth from "../hooks/useAuth";
import policeLogo from "../assets/police-logo.png";

function Login() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setIsInstalled(installed);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) {
      toast.error(
        "Install option not available. Chrome menu मधून Add to Home Screen करा."
      );
      return;
    }

    installPrompt.prompt();

    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      toast.success("App installed successfully");
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await loginOfficerApi({ username, password });

      login(res.data.token, res.data.officer);
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page police-login-page">
      <div className="login-card police-login-card">
        <div className="login-top-badge">
          <ShieldCheck size={15} />
          <span>Secure Police Access</span>
        </div>

        <div className="login-logo-img">
          <img src={policeLogo} alt="Maharashtra Police" />
        </div>

        <h2>{t("officerLogin")}</h2>
        <p>Chhavani Police Station, Malegaon</p>

        <div className="login-language-box">
          <Languages size={18} />
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="mr">मराठी</option>
            <option value="hi">हिंदी</option>
            <option value="en">English</option>
          </select>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-input-group">
            <User size={18} />
            <input
              type="text"
              placeholder={t("username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login-input-group">
            <Lock size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="password-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button className="login-submit-btn" type="submit" disabled={loading}>
            {loading ? "Verifying Officer..." : t("signIn")}
          </button>

          {!isInstalled && (
            <button
              type="button"
              className="install-app-btn"
              onClick={handleInstallApp}
            >
              <Download size={18} />
              Install App
            </button>
          )}
        </form>

        <div className="login-footer-note">
          Authorized police personnel only
        </div>
      </div>
    </div>
  );
}

export default Login;