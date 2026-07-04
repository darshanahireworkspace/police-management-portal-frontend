import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Download,
  CalendarDays,
  X,
  MapPin,
  Phone,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getFestivalPermissions,
  deleteFestivalPermission,
} from "../api/festivalApi";
import VoiceField from "../components/common/VoiceField";

function FestivalPermissions() {
  const navigate = useNavigate();

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const [selectedFestival, setSelectedFestival] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPermissions = async () => {
    try {
      setLoading(true);

      const res = await getFestivalPermissions();

      setPermissions(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load festival permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this festival permission?")) return;

    try {
      await deleteFestivalPermission(id);

      toast.success("Festival permission deleted");

      fetchPermissions();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const filteredPermissions = permissions.filter((item) => {
    const q = searchText.toLowerCase();

    return (
      item.festival_name?.toLowerCase().includes(q) ||
      item.place_name?.toLowerCase().includes(q) ||
      item.organizer_name?.toLowerCase().includes(q) ||
      item.permission_status?.toLowerCase().includes(q) ||
      item.verification_status?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Festival Permission Database</h2>

          <p className="page-subtitle">
            Live festival permissions from MySQL.
          </p>
        </div>

        <button className="primary-btn">
          <Download size={18} />
          Export Excel
        </button>
      </div>

      <div className="table-toolbar">
        <div className="table-search">
          <Search size={18} />
          <VoiceField
            name="searchText"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search festival..."
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
                <th>Festival</th>
                <th>Religious Place</th>
                <th>Organizer</th>
                <th>Crowd</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              ) : filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan="7">No Records Found</td>
                </tr>
              ) : (
                filteredPermissions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="place-cell">
                        <div className="place-icon">
                          <CalendarDays size={18} />
                        </div>

                        <div>
                          <b>{item.festival_name}</b>
                          <p>{item.festival_year}</p>
                        </div>
                      </div>
                    </td>

                    <td>{item.place_name || "-"}</td>

                    <td>{item.organizer_name}</td>

                    <td>{item.expected_crowd}</td>

                    <td>
                      <span
                        className={`status-badge ${item.permission_status.toLowerCase()}`}
                      >
                        {item.permission_status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${item.verification_status.toLowerCase()}`}
                      >
                        {item.verification_status}
                      </span>
                    </td>

                    <td>
                      <div className="action-group">
                        <button
                          onClick={() => {
                            setSelectedFestival(item);
                            setShowModal(true);
                          }}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => {
                            navigate(`/edit-festival-permission/${item.id}`);
                          }}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="danger-action"
                          onClick={() => handleDelete(item.id)}
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
        Showing {filteredPermissions.length} Live Records
      </div>

      {showModal && selectedFestival && (
        <div className="record-modal-overlay">
          <div className="record-modal">
            <div className="record-modal-header">
              <h3>Festival Permission Details</h3>

              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="record-modal-body">
  <div className="modal-summary-card">
    <div>
      <p>Festival Permission</p>
      <h2>{selectedFestival.festival_name || "-"}</h2>
      <span>{selectedFestival.place_name || "No religious place linked"}</span>
    </div>

    <span className={`status-badge ${selectedFestival.permission_status?.toLowerCase()}`}>
      {selectedFestival.permission_status || "Pending"}
    </span>
  </div>

  <div className="details-grid">
    <div className="detail-card">
      <label>Festival Name</label>
      <span>{selectedFestival.festival_name || "-"}</span>
    </div>

    <div className="detail-card">
      <label>Religious Place</label>
      <span>{selectedFestival.place_name || "-"}</span>
    </div>

    <div className="detail-card">
      <label>President</label>
      <span>
        {selectedFestival.president_name ||
          selectedFestival.organizer_name ||
          "-"}
      </span>
    </div>

    <div className="detail-card">
      <label>Secretary</label>
      <span>{selectedFestival.secretary_name || "-"}</span>
    </div>

    <div className="detail-card">
      <label>Police Station</label>
      <span>{selectedFestival.police_station || "-"}</span>
    </div>

    <div className="detail-card">
      <label>Risk Level</label>
      <span>{selectedFestival.risk_level || "-"}</span>
    </div>

    <div className="detail-card">
      <label>Expected Crowd</label>
      <span>{selectedFestival.expected_crowd || "-"}</span>
    </div>

    <div className="detail-card">
      <label>Verification Status</label>
      <span>{selectedFestival.verification_status || "-"}</span>
    </div>

    <div className="detail-card">
      <label>Date</label>
      <span>{selectedFestival.festival_date || selectedFestival.start_date || "-"}</span>
    </div>

    <div className="detail-card">
      <label>Time</label>
      <span>{selectedFestival.festival_time || selectedFestival.start_time || "-"}</span>
    </div>

    <div className="detail-card detail-card-full">
      <label>Address</label>
      <span>{selectedFestival.address || "-"}</span>
    </div>

    <div className="detail-card">
      <label>Latitude</label>
      <span>{selectedFestival.latitude || "-"}</span>
    </div>

    <div className="detail-card">
      <label>Longitude</label>
      <span>{selectedFestival.longitude || "-"}</span>
    </div>
  </div>
</div>



            <div className="modal-buttons">
              {selectedFestival.latitude && selectedFestival.longitude && (
                <a
                  href={
                    selectedFestival.google_map_link ||
                    `https://www.google.com/maps?q=${selectedFestival.latitude},${selectedFestival.longitude}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="modal-btn btn-map"
                >
                  📍 Open Google Map
                </a>
              )}

              {(selectedFestival.president_mobile ||
                selectedFestival.organizer_mobile ||
                selectedFestival.mobile) && (
                <a
                  href={`tel:${
                    selectedFestival.president_mobile ||
                    selectedFestival.organizer_mobile ||
                    selectedFestival.mobile
                  }`}
                  className="modal-btn btn-call"
                >
                  📞 Call President
                </a>
              )}

              <button
                className="modal-btn btn-edit"
                onClick={() =>
                  navigate(`/edit-festival-permission/${selectedFestival.id}`)
                }
              >
                ✏ Edit
              </button>

              <button
                className="modal-btn btn-close"
                onClick={() => setShowModal(false)}
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

export default FestivalPermissions;