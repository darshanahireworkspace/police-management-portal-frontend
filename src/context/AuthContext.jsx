import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("policeToken");
    const user = localStorage.getItem("policeOfficer");

    if (token && user) {
      setOfficer(JSON.parse(user));
    }

    setLoading(false);
  }, []);

  const login = (token, user) => {
    localStorage.setItem("policeToken", token);
    localStorage.setItem("policeOfficer", JSON.stringify(user));
    setOfficer(user);
  };

  const logout = () => {
    localStorage.removeItem("policeToken");
    localStorage.removeItem("policeOfficer");
    setOfficer(null);
  };

  return (
    <AuthContext.Provider value={{ officer, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);