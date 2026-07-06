import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Map,
  PlusCircle,
  FileText,
  Settings,
  Landmark,
  CalendarCheck,
  Store,
  X,
} from "lucide-react";

function MobileBottomNav() {
  const [hidden, setHidden] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let scrollTimer;

    const handleScroll = () => {
      setHidden(true);
      setShowAddMenu(false);

      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setHidden(false);
      }, 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  const handleNavigate = (path) => {
    setShowAddMenu(false);
    navigate(path);
  };

  return (
    <>
      {showAddMenu && (
        <div
          className="bottom-add-overlay"
          onClick={() => setShowAddMenu(false)}
        >
          <div className="bottom-add-menu" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => handleNavigate("/add-religious-place")}>
              <Landmark size={20} />
              Add Religious Place
            </button>

            <button onClick={() => handleNavigate("/add-festival-permission")}>
              <CalendarCheck size={20} />
              Add Festival Permission
            </button>

            <button onClick={() => handleNavigate("/other-places")}>
              <Store size={20} />
              Add Other Place
            </button>
          </div>
        </div>
      )}

      <nav className={`mobile-bottom-nav ${hidden ? "hide-bottom-nav" : ""}`}>
        <NavLink to="/dashboard" onClick={() => setShowAddMenu(false)}>
          <Home size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/map-view" onClick={() => setShowAddMenu(false)}>
          <Map size={20} />
          <span>Map</span>
        </NavLink>

        <button
          type="button"
          className={`bottom-add-btn ${showAddMenu ? "open" : ""}`}
          onClick={() => setShowAddMenu(!showAddMenu)}
        >
          {showAddMenu ? <X size={28} /> : <PlusCircle strokeWidth={2.8} />}
          <span>Add</span>
        </button>

        <NavLink to="/reports" onClick={() => setShowAddMenu(false)}>
          <FileText size={20} />
          <span>Reports</span>
        </NavLink>

        <NavLink to="/settings" onClick={() => setShowAddMenu(false)}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </>
  );
}

export default MobileBottomNav;