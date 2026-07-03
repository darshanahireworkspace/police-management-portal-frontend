import { useEffect, useState } from "react";
import {
  BarChart3,
  ShieldAlert,
  Landmark,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { getReligiousPlaces } from "../api/religiousPlaceApi";
import { getFestivalPermissions } from "../api/festivalApi";

function Analytics() {
  const [places, setPlaces] = useState([]);
  const [festivals, setFestivals] = useState([]);

  const loadData = async () => {
    try {
      const [placeRes, festivalRes] = await Promise.all([
        getReligiousPlaces(),
        getFestivalPermissions(),
      ]);

      setPlaces(placeRes.data.data || []);
      setFestivals(festivalRes.data.data || []);
    } catch {
      toast.error("Failed to load analytics");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const countByType = (type) => places.filter((p) => p.place_type === type).length;
  const countRisk = (risk) => places.filter((p) => p.risk_level === risk).length;
  const countStatus = (status) =>
    festivals.filter((f) => f.permission_status === status).length;

  const maxPlace = Math.max(
    countByType("Temple"),
    countByType("Masjid"),
    countByType("Dargah"),
    countByType("Gurudwara"),
    countByType("Church"),
    1
  );

  const maxRisk = Math.max(
    countRisk("Low"),
    countRisk("Medium"),
    countRisk("High"),
    1
  );

  const maxStatus = Math.max(
    countStatus("Pending"),
    countStatus("Approved"),
    countStatus("Rejected"),
    1
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Analytics Dashboard</h2>
          <p className="page-subtitle">
            Visual analysis of religious places, festival permissions and risk levels.
          </p>
        </div>
      </div>

      <div className="analytics-top-grid">
        <div className="analytics-stat-card">
          <Landmark size={24} />
          <h3>{places.length}</h3>
          <p>Total Religious Places</p>
        </div>

        <div className="analytics-stat-card purple">
          <CalendarCheck size={24} />
          <h3>{festivals.length}</h3>
          <p>Total Festival Permissions</p>
        </div>

        <div className="analytics-stat-card red">
          <ShieldAlert size={24} />
          <h3>{countRisk("High")}</h3>
          <p>High Risk Locations</p>
        </div>

        <div className="analytics-stat-card green">
          <TrendingUp size={24} />
          <h3>{countStatus("Approved")}</h3>
          <p>Approved Permissions</p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-panel">
          <div className="analytics-title">
            <BarChart3 size={20} />
            <h3>Religious Places Category</h3>
          </div>

          {[
            ["Temple", countByType("Temple")],
            ["Masjid", countByType("Masjid")],
            ["Dargah", countByType("Dargah")],
            ["Gurudwara", countByType("Gurudwara")],
            ["Church", countByType("Church")],
          ].map(([label, value]) => (
            <div className="bar-row" key={label}>
              <span>{label}</span>
              <div className="bar-track">
                <div style={{ width: `${(value / maxPlace) * 100}%` }}></div>
              </div>
              <b>{value}</b>
            </div>
          ))}
        </div>

        <div className="analytics-panel">
          <div className="analytics-title">
            <ShieldAlert size={20} />
            <h3>Risk Distribution</h3>
          </div>

          {[
            ["Low", countRisk("Low")],
            ["Medium", countRisk("Medium")],
            ["High", countRisk("High")],
          ].map(([label, value]) => (
            <div className="bar-row" key={label}>
              <span>{label}</span>
              <div className={`bar-track risk-${label.toLowerCase()}`}>
                <div style={{ width: `${(value / maxRisk) * 100}%` }}></div>
              </div>
              <b>{value}</b>
            </div>
          ))}
        </div>

        <div className="analytics-panel full-analytics">
          <div className="analytics-title">
            <CalendarCheck size={20} />
            <h3>Festival Permission Status</h3>
          </div>

          {[
            ["Pending", countStatus("Pending")],
            ["Approved", countStatus("Approved")],
            ["Rejected", countStatus("Rejected")],
          ].map(([label, value]) => (
            <div className="bar-row" key={label}>
              <span>{label}</span>
              <div className={`bar-track status-${label.toLowerCase()}`}>
                <div style={{ width: `${(value / maxStatus) * 100}%` }}></div>
              </div>
              <b>{value}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Analytics;