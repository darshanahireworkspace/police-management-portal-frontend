import { useEffect, useMemo, useState } from "react";
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
  const [flyPosition, setFlyPosition] = useState(null);

  const [showPlaces, setShowPlaces] = useState(true);
  const [showFestivals, setShowFestivals] = useState(true);
  const [riskFilter, setRiskFilter] = useState("All");
  const [mapMode, setMapMode] = useState("street");
  const [searchText, setSearchText] = useState("");

  const fetchMapData = async () => {
    try {
      const [placeRes, festivalRes] = await Promise.all([
        getReligiousPlaces(),
        getFestivalPermissions(),
      ]);

      setPlaces(
        (placeRes.data.data || []).filter((p) => p.latitude && p.longitude)
      );

      setFestivals(
        (festivalRes.data.data || []).filter((f) => f.latitude && f.longitude)
      );
    } catch {
      toast.error("Failed to load GIS data");
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

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

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFlyPosition([
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
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url={tileUrl}
            />

            <FlyToLocation position={flyPosition} />

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
        </aside>
      </div>
    </div>
  );
}

export default MapView;