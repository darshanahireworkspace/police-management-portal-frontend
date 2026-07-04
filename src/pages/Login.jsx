import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import policeLogo from "../assets/police-logo.png";
import { loginOfficerApi } from "../api/authApi";
import useAuth from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await loginOfficerApi({
        username,
        password,
      });

      login(res.data.token, res.data.officer);

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    login("demo-token", {
      id: 1,
      full_name: "Demo Police Officer",
      username: "demo",
      role: "Officer",
      police_station: "Demo Police Station",
    });

    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-img">
          <img src={policeLogo} alt="Maharashtra Police" />
        </div>

        <h2>{t("officerLogin")}</h2>
        <p>{t("appName")}</p>

        <select
          className="language-select full"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          <option value="mr">मराठी</option>
          <option value="hi">हिंदी</option>
          <option value="en">English</option>
        </select>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder={t("username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="login-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Checking..." : t("signIn")}
          </button>

          <button
            className="demo-login-btn"
            type="button"
            onClick={handleDemoLogin}
          >
            Demo Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;