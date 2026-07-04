import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Download,
  Landmark,
  X,
  MapPin,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getReligiousPlaces,
  deleteReligiousPlace,
} from "../api/religiousPlaceApi";

function ReligiousPlaces() {
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [search, setSearch] = useState("");

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const res = await getReligiousPlaces();
      setPlaces(res.data.data || []);
    } catch {
      toast.error("Failed to load religious places");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this religious place?")) return;

    try {
      await deleteReligiousPlace(id);
      toast.success("Record deleted successfully");
      fetchPlaces();
    } catch {
      toast.error("Failed to delete record");
    }
  };

  const filteredPlaces = places.filter((place) => {
    const q = search.toLowerCase();

    return (
      place.place_name?.toLowerCase().includes(q) ||
      place.place_type?.toLowerCase().includes(q) ||
      place.area?.toLowerCase().includes(q) ||
      place.contact_person?.toLowerCase().includes(q) ||
      place.contact_mobile?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Religious Places Database</h2>
          <p className="page-subtitle">Live records from MySQL database.</p>
        </div>

        <button className="primary-btn">
          <Download size={18} />
          Export Excel
        </button>
      </div>

      <div className="table-toolbar">
        <div className="table-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, area, contact, mobile..."
          />
        </div>

        <button className="filter-btn">
          <Filter size={18} />
          Filter
        </button>
      </div>

      <div className="data-table-card">
        <div className="table-responsive">
          <table className="professional-table">
            <thead>
              <tr>
                <th>Place</th>
                <th>Type</th>
                <th>Area / Ward</th>
                <th>Contact Person</th>
                <th>Mobile</th>
                <th>Risk</th>
                <th>Police Station</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">Loading records...</td>
                </tr>
              ) : filteredPlaces.length === 0 ? (
                <tr>
                  <td colSpan="8">No religious place records found.</td>
                </tr>
              ) : (
                filteredPlaces.map((place) => (
                  <tr key={place.id}>
                    <td>
                      <div className="place-cell">
                        <div className="place-icon">
                          <Landmark size={18} />
                        </div>
                        <div>
                          <b>{place.place_name}</b>
                          <p>Police record #{place.id}</p>
                        </div>
                      </div>
                    </td>

                    <td>{place.place_type}</td>

                    <td>
                      {place.area || "-"}
                      {place.ward ? ` / ${place.ward}` : ""}
                    </td>

                    <td>{place.contact_person || "-"}</td>
                    <td>{place.contact_mobile || "-"}</td>

                    <td>
                      <span
                        className={`risk-badge ${(
                          place.risk_level || "low"
                        ).toLowerCase()}`}
                      >
                        {place.risk_level || "Low"}
                      </span>
                    </td>

                    <td>{place.police_station || "-"}</td>

                    <td>
                      <div className="action-group">
                        <button title="View" onClick={() => setSelectedPlace(place)}>
                          <Eye size={16} />
                        </button>

                        <button
                          title="Edit"
                          onClick={() =>
                            navigate(`/edit-religious-place/${place.id}`)
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          title="Delete"
                          className="danger-action"
                          onClick={() => handleDelete(place.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination-row">
        <p>Showing {filteredPlaces.length} live records</p>
      </div>

      {selectedPlace && (
        <div className="record-modal-overlay" onClick={() => setSelectedPlace(null)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()}>
            <div className="record-modal-header">
              <div>
                <span>Religious Place Details</span>
                <h2>{selectedPlace.place_name}</h2>
                <p>
                  {selectedPlace.place_type} • {selectedPlace.area || "-"}
                </p>
              </div>

              <button onClick={() => setSelectedPlace(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="record-detail-grid">
              <div>
                <label>Place Name</label>
                <b>{selectedPlace.place_name || "-"}</b>
              </div>

              <div>
                <label>Type</label>
                <b>{selectedPlace.place_type || "-"}</b>
              </div>

              <div>
                <label>Religion</label>
                <b>{selectedPlace.religion || "-"}</b>
              </div>

              <div>
                <label>Risk Level</label>
                <b>{selectedPlace.risk_level || "-"}</b>
              </div>

              <div>
                <label>Contact Person</label>
                <b>{selectedPlace.contact_person || "-"}</b>
              </div>

              <div>
                <label>Mobile</label>
                <b>{selectedPlace.contact_mobile || "-"}</b>
              </div>

              <div>
                <label>Police Station</label>
                <b>{selectedPlace.police_station || "-"}</b>
              </div>

              <div>
                <label>Area</label>
                <b>{selectedPlace.area || "-"}</b>
              </div>

              <div>
                <label>Address</label>
                <b>{selectedPlace.address || "-"}</b>
              </div>

              <div>
                <label>Pincode</label>
                <b>{selectedPlace.pincode || "-"}</b>
              </div>

              <div>
                <label>Latitude</label>
                <b>{selectedPlace.latitude || "-"}</b>
              </div>

              <div>
                <label>Longitude</label>
                <b>{selectedPlace.longitude || "-"}</b>
              </div>
            </div>

            <div className="modal-action-row">
              {selectedPlace.contact_mobile && (
                <a href={`tel:${selectedPlace.contact_mobile}`}>
                  <Phone size={17} />
                  Call
                </a>
              )}

              {selectedPlace.google_map_link && (
                <a href={selectedPlace.google_map_link} target="_blank">
                  <MapPin size={17} />
                  Open Map
                </a>
              )}

              <button
                onClick={() =>
                  navigate(`/edit-religious-place/${selectedPlace.id}`)
                }
              >
                <Pencil size={17} />
                Edit
              </button>
            </div>

            <div className="modal-notes">
              <label>Police Notes</label>
              <p>{selectedPlace.sensitive_notes || "No notes added."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReligiousPlaces;