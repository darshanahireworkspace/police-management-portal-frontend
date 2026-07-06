import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import {
  Layers,
  Navigation,
  ShieldAlert,
  Search,
  Church,
  CalendarCheck,
} from "lucide-react";
import L from "leaflet";
import toast from "react-hot-toast";

import { getReligiousPlaces } from "../api/religiousPlaceApi";
import { getFestivalPermissions } from "../api/festivalApi";
import { getOtherPlaces } from "../api/otherPlaceApi";

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

const createOtherIcon = () =>
  new L.DivIcon({
    className: "custom-risk-marker",
    html: `<div class="other-marker-square"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const createUserLocationIcon = () =>
  new L.DivIcon({
    className: "user-location-marker",
    html: `<div class="user-location-dot"><span></span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

function FlyToLocation({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [position, map]);

  return null;
}

function MapView() {
  const [places, setPlaces] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [otherPlaces, setOtherPlaces] = useState([]);
  const [flyPosition, setFlyPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const mapRef = useRef(null);

  const [showPlaces, setShowPlaces] = useState(true);
  const [showFestivals, setShowFestivals] = useState(true);
  const [showOther, setShowOther] = useState(true);
  const [riskFilter, setRiskFilter] = useState("All");
  const [mapMode, setMapMode] = useState("street");
  const [searchText, setSearchText] = useState("");

  const fetchMapData = async () => {
    try {
      const [placeRes, festivalRes, otherRes] = await Promise.all([
        getReligiousPlaces(),
        getFestivalPermissions(),
        getOtherPlaces(),
      ]);

      setPlaces(
        (placeRes.data.data || []).filter((p) => p.latitude && p.longitude)
      );

      setFestivals(
        (festivalRes.data.data || []).filter((f) => f.latitude && f.longitude)
      );

      setOtherPlaces(
        (otherRes.data.data || []).filter((o) => o.latitude && o.longitude)
      );
    } catch {
      toast.error("Failed to load GIS data");
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  useEffect(() => {
    const command = localStorage.getItem("mapCommand");

    if (command === "highRisk") {
      setRiskFilter("High");
      localStorage.removeItem("mapCommand");
      toast.success("High risk locations highlighted");
    }

    if (command === "mediumRisk") {
      setRiskFilter("Medium");
      localStorage.removeItem("mapCommand");
      toast.success("Medium risk locations highlighted");
    }

    if (command === "lowRisk") {
      setRiskFilter("Low");
      localStorage.removeItem("mapCommand");
      toast.success("Low risk locations highlighted");
    }
  }, []);

  const getAllMapRecords = () => {
    const religious = places.map((item) => ({
      ...item,
      type: "Religious Place",
      title: item.place_name,
      subtitle: `${item.place_type || "-"} • ${item.area || "-"}`,
    }));

    const festivalRecords = festivals.map((item) => ({
      ...item,
      type: "Festival Mandal",
      title: item.organizer_name || item.mandal_name || item.festival_name,
      subtitle: `${item.festival_name || "-"} • ${item.area || "-"}`,
    }));

    const others = otherPlaces.map((item) => ({
      ...item,
      type: "Other City Data",
      title: item.place_name,
      subtitle: `${item.category || "-"} • ${item.area || "-"}`,
    }));

    return [...religious, ...festivalRecords, ...others].filter(
      (item) => item.latitude && item.longitude
    );
  };

  useEffect(() => {
    const search = localStorage.getItem("mapSearch");

    if (!search) return;

    const timer = setTimeout(() => {
      const q = search.toLowerCase().trim();
      const allRecords = getAllMapRecords();

      const found = allRecords.find((item) => {
        const text = `
          ${item.title || ""}
          ${item.place_name || ""}
          ${item.organizer_name || ""}
          ${item.mandal_name || ""}
          ${item.festival_name || ""}
          ${item.category || ""}
          ${item.area || ""}
          ${item.address || ""}
          ${item.mobile || ""}
          ${item.contact_mobile || ""}
        `.toLowerCase();

        return text.includes(q);
      });

      if (found) {
        const lat = Number(found.latitude);
        const lng = Number(found.longitude);

        setSelectedRecord(found);

        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 17, {
            animate: true,
            duration: 1.4,
          });
        }

        toast.success(`${found.title} found`);
      } else {
        setSearchText(search);
        toast.error("Exact record not found. Showing search result.");
      }

      localStorage.removeItem("mapSearch");
    }, 900);

    return () => clearTimeout(timer);
  }, [places, festivals, otherPlaces]);

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchesRisk = riskFilter === "All" || p.risk_level === riskFilter;
      const matchesSearch =
        !searchText ||
        p.place_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.area?.toLowerCase().includes(searchText.toLowerCase());

      return matchesRisk && matchesSearch;
    });
  }, [places, riskFilter, searchText]);

  const filteredFestivals = useMemo(() => {
    return festivals.filter((f) => {
      return (
        !searchText ||
        f.organizer_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        f.festival_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        f.area?.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }, [festivals, searchText]);

  const filteredOtherPlaces = useMemo(() => {
    return otherPlaces.filter((o) => {
      return (
        !searchText ||
        o.place_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        o.category?.toLowerCase().includes(searchText.toLowerCase()) ||
        o.area?.toLowerCase().includes(searchText.toLowerCase()) ||
        o.address?.toLowerCase().includes(searchText.toLowerCase()) ||
        o.mobile?.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }, [otherPlaces, searchText]);

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFlyPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);
        toast.success("Current location found");
      },
      () => toast.error("Location permission denied")
    );
  };

  const tileUrl =
    mapMode === "satellite"
      ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const highRiskCount = places.filter((p) => p.risk_level === "High").length;

  return (
    <div className="command-map-page">
      <div className="command-map-header">
        <div>
          <h2>City GIS Command Center</h2>
          <p>Permanent religious places + temporary festival mandals</p>
        </div>

        <button className="primary-btn" onClick={handleCurrentLocation}>
          <Navigation size={18} />
          My Location
        </button>
      </div>

      <div className="gis-shell">
        <aside className="gis-left-panel">
          <div className="gis-panel-title">
            <Layers size={19} />
            <h3>Map Layers</h3>
          </div>

          <label className="layer-toggle">
            <input
              type="checkbox"
              checked={showPlaces}
              onChange={(e) => setShowPlaces(e.target.checked)}
            />
            Permanent Religious Places
          </label>

          <label className="layer-toggle">
            <input
              type="checkbox"
              checked={showFestivals}
              onChange={(e) => setShowFestivals(e.target.checked)}
            />
            Festival Mandals
          </label>

          <label className="layer-toggle">
            <input
              type="checkbox"
              checked={showOther}
              onChange={(e) => setShowOther(e.target.checked)}
            />
            Other City Data
          </label>

          <div className="gis-divider"></div>

          <h4>Risk Filter</h4>

          <select
            className="gis-select"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <h4>Map Mode</h4>

          <select
            className="gis-select"
            value={mapMode}
            onChange={(e) => setMapMode(e.target.value)}
          >
            <option value="street">Street Map</option>
            <option value="satellite">Terrain Map</option>
          </select>

          <div className="gis-divider"></div>

          <h4>Legend</h4>

          <div className="legend-list">
            <span><i className="legend-circle"></i> Permanent Place</span>
            <span><i className="legend-diamond"></i> Festival Mandal</span>
            <span><i className="legend-low"></i> Low Risk</span>
            <span><i className="legend-medium"></i> Medium Risk</span>
            <span><i className="legend-high"></i> High Risk</span>
          </div>

          <div className="risk-alert-box">
            <ShieldAlert size={22} />
            <div>
              <h4>High Risk</h4>
              <p>{highRiskCount} permanent locations</p>
            </div>
          </div>
        </aside>

        <main className="gis-map-area">
          <div className="gis-search-floating">
            <Search size={18} />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search place, mandal, area..."
            />
          </div>

          <MapContainer
            center={[20.5579, 74.5287]}
            zoom={13}
            scrollWheelZoom={true}
            className="command-leaflet-map"
            ref={mapRef}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url={tileUrl}
            />

            <FlyToLocation position={flyPosition} />

            {userLocation && (
              <Marker position={userLocation} icon={createUserLocationIcon()}>
                <Popup>
                  <b>Your Live Location</b>
                </Popup>
              </Marker>
            )}

            {showPlaces &&
              filteredPlaces.map((place) => (
                <Marker
                  key={`place-${place.id}`}
                  position={[
                    Number(place.latitude),
                    Number(place.longitude),
                  ]}
                  icon={createPlaceIcon(riskColor[place.risk_level] || riskColor.Low)}
                >
                  <Popup>
                    <div className="map-popup">
                      <h3>{place.place_name}</h3>
                      <p><b>Type:</b> Permanent Religious Place</p>
                      <p><b>Category:</b> {place.place_type}</p>
                      <p><b>Area:</b> {place.area || "-"}</p>
                      <p><b>Risk:</b> {place.risk_level || "Low"}</p>
                      <p><b>Police Station:</b> {place.police_station || "-"}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {showFestivals &&
              filteredFestivals.map((festival) => (
                <Marker
                  key={`festival-${festival.id}`}
                  position={[
                    Number(festival.latitude),
                    Number(festival.longitude),
                  ]}
                  icon={createFestivalIcon()}
                >
                  <Popup>
                    <div className="map-popup">
                      <h3>{festival.organizer_name}</h3>
                      <p><b>Type:</b> Temporary Festival Mandal</p>
                      <p><b>Festival:</b> {festival.festival_name}</p>
                      <p><b>Adhyaksha:</b> {festival.president_name || "-"}</p>
                      <p><b>Mobile:</b> {festival.president_mobile || "-"}</p>
                      <p><b>Permission:</b> {festival.permission_status}</p>
                      <p><b>Miravnuk:</b> {festival.procession ? "Yes" : "No"}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {showOther &&
              filteredOtherPlaces.map((item) => (
                <Marker
                  key={`other-${item.id}`}
                  position={[Number(item.latitude), Number(item.longitude)]}
                  icon={createOtherIcon()}
                >
                  <Popup>
                    <div className="map-popup">
                      <h3>{item.place_name}</h3>
                      <p><b>Type:</b> Other City Data</p>
                      <p><b>Category:</b> {item.category}</p>
                      <p><b>Area:</b> {item.area || "-"}</p>
                      <p><b>Mobile:</b> {item.mobile || "-"}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </main>

        <aside className="gis-right-panel">
          <h3>Live Records</h3>

          <div className="gis-count-grid">
            <div>
              <b>{filteredPlaces.length}</b>
              <span>Places</span>
            </div>

            <div>
              <b>{filteredFestivals.length}</b>
              <span>Mandals</span>
            </div>

            <div>
              <b>{filteredOtherPlaces.length}</b>
              <span>Other</span>
            </div>
          </div>

          <h4>Permanent Places</h4>

          <div className="gis-record-list">
            {filteredPlaces.map((place) => (
              <div
                className="gis-record-card"
                key={`side-place-${place.id}`}
                onClick={() =>
                  setFlyPosition([
                    Number(place.latitude),
                    Number(place.longitude),
                  ])
                }
              >
                <Church size={18} />
                <div>
                  <b>{place.place_name}</b>
                  <p>{place.place_type} • {place.area || "-"}</p>
                </div>
              </div>
            ))}
          </div>

          <h4>Festival Mandals</h4>

          <div className="gis-record-list">
            {filteredFestivals.map((festival) => (
              <div
                className="gis-record-card festival"
                key={`side-festival-${festival.id}`}
                onClick={() =>
                  setFlyPosition([
                    Number(festival.latitude),
                    Number(festival.longitude),
                  ])
                }
              >
                <CalendarCheck size={18} />
                <div>
                  <b>{festival.organizer_name}</b>
                  <p>{festival.festival_name} • {festival.permission_status}</p>
                </div>
              </div>
            ))}
          </div>

          <h4>Other City Data</h4>

          <div className="gis-record-list">
            {filteredOtherPlaces.map((item) => (
              <div
                className="gis-record-card other"
                key={`side-other-${item.id}`}
                onClick={() => {
                  setFlyPosition([
                    Number(item.latitude),
                    Number(item.longitude),
                  ]);
                  setSelectedRecord({
                    ...item,
                    type: "Other City Data",
                    title: item.place_name,
                    subtitle: `${item.category || "-"} • ${item.area || "-"}`,
                  });
                }}
              >
                <Layers size={18} />
                <div>
                  <b>{item.place_name}</b>
                  <p>{item.category} • {item.area || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {selectedRecord && (
        <div
          className="record-modal-overlay"
          onClick={() => setSelectedRecord(null)}
        >
          <div className="record-modal" onClick={(e) => e.stopPropagation()}>
            <div className="record-modal-header">
              <div>
                <span>{selectedRecord.type}</span>
                <h2>{selectedRecord.title}</h2>
                <p>{selectedRecord.subtitle}</p>
              </div>

              <button
                className="record-modal-close"
                onClick={() => setSelectedRecord(null)}
              >
                ×
              </button>
            </div>

            <div className="record-detail-grid">
              <div className="detail-card">
                <label>Name</label>
                <span>{selectedRecord.title || "-"}</span>
              </div>

              <div className="detail-card">
                <label>Type</label>
                <span>{selectedRecord.type || "-"}</span>
              </div>

              <div className="detail-card">
                <label>Area</label>
                <span>{selectedRecord.area || "-"}</span>
              </div>

              <div className="detail-card">
                <label>Mobile</label>
                <span>
                  {selectedRecord.mobile ||
                    selectedRecord.contact_mobile ||
                    selectedRecord.president_mobile ||
                    "-"}
                </span>
              </div>

              <div className="detail-card">
                <label>Address</label>
                <span>{selectedRecord.address || "-"}</span>
              </div>

              <div className="detail-card">
                <label>Latitude</label>
                <span>{selectedRecord.latitude || "-"}</span>
              </div>

              <div className="detail-card">
                <label>Longitude</label>
                <span>{selectedRecord.longitude || "-"}</span>
              </div>
            </div>

            <div className="modal-buttons">
              <a
                className="modal-btn btn-map"
                href={`https://www.google.com/maps?q=${selectedRecord.latitude},${selectedRecord.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                Open Google Map
              </a>

              <button
                className="modal-btn btn-close"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;