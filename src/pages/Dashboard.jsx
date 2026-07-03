import { useEffect, useState } from "react";
import {
  Landmark,
  Church,
  Moon,
  MapPin,
  ShieldAlert,
  CalendarCheck,
  RefreshCcw,
  Search,
  X,
  ExternalLink,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";

import { getDashboardStats } from "../api/dashboardApi";
import { getPoliceStations } from "../api/policeStationApi";
import useAuth from "../hooks/useAuth";
import VoiceField from "../components/common/VoiceField";

const riskColor = {
  Low: "#16a34a",
  Medium: "#f59e0b",
  High: "#dc2626",
};

const createPlaceIcon = (color) =>
  new L.DivIcon({
    className: "custom-risk-marker",
    html: `<div style="background:${color}" class="place-marker-dot"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const createFestivalIcon = () =>
  new L.DivIcon({
    className: "custom-risk-marker",
    html: `<div class="festival-marker-diamond"></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

function Dashboard() {
  const { officer } = useAuth();

  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState("places");
  const [mapFilter, setMapFilter] = useState("all");
  const [policeStations, setPoliceStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [stats, setStats] = useState({});
  const [religiousPlaces, setReligiousPlaces] = useState([]);
  const [festivalPermissions, setFestivalPermissions] = useState([]);

  const fetchDashboard = async (station = selectedStation) => {
    try {
      setLoading(true);
      const res = await getDashboardStats(station);

      setStats(res.data.stats || {});
      setReligiousPlaces(res.data.religiousPlaces || []);
      setFestivalPermissions(res.data.festivalPermissions || []);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadStations = async () => {
      try {
        const res = await getPoliceStations();
        setPoliceStations(res.data.data || []);
      } catch {
        toast.error("Failed to load police stations");
      }
    };

    loadStations();
    fetchDashboard("");
  }, []);

  const cards = [
    { key: "places", title: "Religious Places", value: stats.totalPlaces || 0, icon: <Landmark /> },
    { key: "temples", title: "Temples", value: stats.temples || 0, icon: <Church /> },
    { key: "masjids", title: "Masjids", value: stats.masjids || 0, icon: <Moon /> },
    { key: "dargahs", title: "Dargah", value: stats.dargahs || 0, icon: <MapPin /> },
    { key: "festivals", title: "Festival Permissions", value: stats.festivalPermissions || 0, icon: <CalendarCheck /> },
    { key: "highRisk", title: "High Risk", value: stats.highRisk || 0, icon: <ShieldAlert /> },
  ];

  const searchResults = [
    ...religiousPlaces.map((item) => ({
      ...item,
      recordType: "Religious Place",
      title: item.place_name,
      subtitle: `${item.place_type || "-"} • ${item.area || "-"}`,
    })),

    ...festivalPermissions.map((item) => ({
      ...item,
      recordType: "Festival Mandal",
      title: item.organizer_name,
      subtitle: `${item.festival_name || "-"} • ${item.area || "-"}`,
    })),
  ].filter((item) => {
    const q = dashboardSearch.toLowerCase();

    return (
      item.title?.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.contact_person?.toLowerCase().includes(q) ||
      item.president_name?.toLowerCase().includes(q)
    );
  });

  const filteredPlaces = religiousPlaces.filter((place) => {
    if (selectedModule === "temples") return place.place_type === "Temple";
    if (selectedModule === "masjids") return place.place_type === "Masjid";
    if (selectedModule === "dargahs") return place.place_type === "Dargah";
    if (selectedModule === "highRisk") return place.risk_level === "High";
    return true;
  });

  return (
    <div>
      <div className="dashboard-hero">
        <div>
          <span className="status-pill">Live Database</span>
          <h2>Welcome, {officer?.full_name || "Officer"}</h2>
          <p>Live dashboard for religious places and festival permissions.</p>
        </div>
      </div>

      <div className="dashboard-search-card">
        <div className="dashboard-live-search">
          <Search size={18} />
          <VoiceField
            name="dashboardSearch"
            value={dashboardSearch}
            onChange={(e) => setDashboardSearch(e.target.value)}
            placeholder="Search mandir, masjid, mandal, adhyaksha, area..."
          />
        </div>

        {dashboardSearch && (
          <div className="dashboard-search-results">
            {searchResults.length === 0 ? (
              <p>No matching record found.</p>
            ) : (
              searchResults.map((item) => (
                <button
                  key={`${item.recordType}-${item.id}`}
                  onClick={() => setSelectedRecord(item)}
                >
                  <b>{item.title}</b>
                  <span>{item.recordType} • {item.subtitle}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="dashboard-action-row">
        <select
          className="dashboard-filter-select"
          value={selectedStation}
          onChange={(e) => {
            setSelectedStation(e.target.value);
            fetchDashboard(e.target.value);
          }}
        >
          <option value="">All Police Stations</option>
          {policeStations.map((station) => (
            <option key={station.id} value={station.station_name}>
              {station.station_name}
            </option>
          ))}
        </select>

        <button className="secondary-btn" onClick={() => fetchDashboard()}>
          <RefreshCcw size={18} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <div
            className={`stat-card ${selectedModule === card.key ? "active-stat-card" : ""}`}
            key={card.key}
            onClick={() => setSelectedModule(card.key)}
          >
            <div className="stat-icon">{card.icon}</div>
            <div>
              <h3>{loading ? "..." : card.value}</h3>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-map-card">
        <div className="dashboard-map-header">
          <div>
            <h3>Live City Map Overview</h3>
            <p>Registered religious places and festival mandals</p>
          </div>

          <div className="dashboard-map-stats">
            <span>
              Religious Places: <b>{stats.totalPlaces || 0}</b>
            </span>
            <span>
              Mandals: <b>{stats.festivalPermissions || 0}</b>
            </span>
          </div>
        </div>

        <div className="dashboard-map-filters">
          <button className={mapFilter === "all" ? "active" : ""} onClick={() => setMapFilter("all")}>
            All
          </button>
          <button className={mapFilter === "places" ? "active" : ""} onClick={() => setMapFilter("places")}>
            🛕 Religious
          </button>
          <button className={mapFilter === "festival" ? "active" : ""} onClick={() => setMapFilter("festival")}>
            🎉 Mandals
          </button>
          <button className={mapFilter === "high" ? "active" : ""} onClick={() => setMapFilter("high")}>
            🔴 High
          </button>
          <button className={mapFilter === "medium" ? "active" : ""} onClick={() => setMapFilter("medium")}>
            🟠 Medium
          </button>
          <button className={mapFilter === "low" ? "active" : ""} onClick={() => setMapFilter("low")}>
            🟢 Low
          </button>
        </div>

        <div className="dashboard-map-box">
          <MapContainer
            center={[20.5579, 74.5287]}
            zoom={12}
            scrollWheelZoom={false}
            className="dashboard-mini-map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {religiousPlaces
              .filter((place) => place.latitude && place.longitude)
              .filter((place) => {
                if (mapFilter === "places") return true;
                if (mapFilter === "festival") return false;
                if (mapFilter === "high") return place.risk_level === "High";
                if (mapFilter === "medium") return place.risk_level === "Medium";
                if (mapFilter === "low") return place.risk_level === "Low";
                return true;
              })
              .map((place) => (
                <Marker
                  key={`dash-place-${place.id}`}
                  position={[Number(place.latitude), Number(place.longitude)]}
                  icon={createPlaceIcon(riskColor[place.risk_level] || riskColor.Low)}
                >
                  <Popup>
                    <b>{place.place_name}</b>
                    <br />
                    {place.place_type}
                    <br />
                    <button
                      className="popup-details-btn"
                      onClick={() =>
                        setSelectedRecord({
                          ...place,
                          recordType: "Religious Place",
                          title: place.place_name,
                          subtitle: `${place.place_type} • ${place.area || "-"}`,
                        })
                      }
                    >
                      View Full Details
                    </button>
                  </Popup>
                </Marker>
              ))}

            {(mapFilter === "all" || mapFilter === "festival") &&
              festivalPermissions
                .filter((festival) => festival.latitude && festival.longitude)
                .map((festival) => (
                  <Marker
                    key={`dash-festival-${festival.id}`}
                    position={[Number(festival.latitude), Number(festival.longitude)]}
                    icon={createFestivalIcon()}
                  >
                    <Popup>
                      <b>{festival.organizer_name}</b>
                      <br />
                      {festival.festival_name}
                      <br />
                      <button
                        className="popup-details-btn"
                        onClick={() =>
                          setSelectedRecord({
                            ...festival,
                            recordType: "Festival Mandal",
                            title: festival.organizer_name,
                            subtitle: `${festival.festival_name} • ${festival.area || "-"}`,
                          })
                        }
                      >
                        View Full Details
                      </button>
                    </Popup>
                  </Marker>
                ))}
          </MapContainer>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="panel-card dashboard-details-panel">
          <h3>
            {selectedModule === "festivals"
              ? "Festival Permission Records"
              : "Religious Place Records"}
          </h3>

          {selectedModule === "festivals" ? (
            festivalPermissions.length === 0 ? (
              <p>No festival permissions found.</p>
            ) : (
              festivalPermissions.map((item) => (
                <div className="event-row" key={item.id}>
                  <span>
                    <b>{item.organizer_name}</b>
                    <br />
                    <small>
                      {item.festival_name} • {item.permission_status} • {item.area || "-"}
                    </small>
                  </span>

                  <span className="permission-status pending">
                    {item.permission_status}
                  </span>
                </div>
              ))
            )
          ) : filteredPlaces.length === 0 ? (
            <p>No religious places found.</p>
          ) : (
            filteredPlaces.map((place) => (
              <div className="event-row" key={place.id}>
                <span>
                  <b>{place.place_name}</b>
                  <br />
                  <small>
                    {place.place_type} • {place.area || "-"} • {place.police_station || "-"}
                  </small>
                </span>

                <span className={`risk-badge ${(place.risk_level || "low").toLowerCase()}`}>
                  {place.risk_level || "Low"}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="panel-card activity-panel">
          <h3>Recent Activity</h3>

          <div className="activity-item">
            <span className="activity-dot blue"></span>
            <div>
              <b>Religious Place Registered</b>
              <p>{religiousPlaces[0]?.place_name || "No recent place record"}</p>
            </div>
          </div>

          <div className="activity-item">
            <span className="activity-dot purple"></span>
            <div>
              <b>Festival Permission Added</b>
              <p>{festivalPermissions[0]?.organizer_name || "No recent festival record"}</p>
            </div>
          </div>

          <div className="activity-item">
            <span className="activity-dot red"></span>
            <div>
              <b>High Risk Locations</b>
              <p>{stats.highRisk || 0} locations marked high risk</p>
            </div>
          </div>

          <div className="activity-item">
            <span className="activity-dot green"></span>
            <div>
              <b>System Status</b>
              <p>Database connected and live monitoring active</p>
            </div>
          </div>
        </div>
      </div>

      {selectedRecord && (
        <div className="record-modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()}>
            <div className="record-modal-header">
              <div>
                <span>{selectedRecord.recordType}</span>
                <h2>{selectedRecord.title}</h2>
                <p>{selectedRecord.subtitle}</p>
              </div>

              <button onClick={() => setSelectedRecord(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="record-detail-grid">
              <div>
                <label>Name</label>
                <b>{selectedRecord.title || "-"}</b>
              </div>

              <div>
                <label>Type / Festival</label>
                <b>{selectedRecord.place_type || selectedRecord.festival_name || "-"}</b>
              </div>

              <div>
                <label>Area</label>
                <b>{selectedRecord.area || "-"}</b>
              </div>

              <div>
                <label>Address</label>
                <b>{selectedRecord.address || "-"}</b>
              </div>

              <div>
                <label>Contact / Adhyaksha</label>
                <b>{selectedRecord.contact_person || selectedRecord.president_name || "-"}</b>
              </div>

              <div>
                <label>Mobile</label>
                <b>{selectedRecord.contact_mobile || selectedRecord.president_mobile || "-"}</b>
              </div>

              <div>
                <label>Risk / Permission</label>
                <b>{selectedRecord.risk_level || selectedRecord.permission_status || "-"}</b>
              </div>

              <div>
                <label>Police Station</label>
                <b>{selectedRecord.police_station || "-"}</b>
              </div>

              <div>
                <label>Latitude</label>
                <b>{selectedRecord.latitude || "-"}</b>
              </div>

              <div>
                <label>Longitude</label>
                <b>{selectedRecord.longitude || "-"}</b>
              </div>
            </div>

            {selectedRecord.google_map_link && (
              <a
                className="modal-map-link"
                href={selectedRecord.google_map_link}
                target="_blank"
              >
                <ExternalLink size={17} />
                Open in Google Maps
              </a>
            )}

            <div className="modal-notes">
              <label>Notes</label>
              <p>
                {selectedRecord.sensitive_notes ||
                  selectedRecord.police_notes ||
                  "No notes added."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;