import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Download,
  Landmark,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getReligiousPlaces,
  deleteReligiousPlace,
} from "../api/religiousPlaceApi";
import VoiceField from "../components/common/VoiceField";

function ReligiousPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const res = await getReligiousPlaces();
      setPlaces(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load religious places");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this religious place?");

    if (!confirmDelete) return;

    try {
      await deleteReligiousPlace(id);
      toast.success("Record deleted successfully");
      fetchPlaces();
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const filteredPlaces = places.filter((place) => {
    const q = searchText.toLowerCase();

    return (
      place.place_name?.toLowerCase().includes(q) ||
      place.area?.toLowerCase().includes(q) ||
      place.contact_person?.toLowerCase().includes(q) ||
      place.contact_mobile?.toLowerCase().includes(q) ||
      place.police_station?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Religious Places Database</h2>
          <p className="page-subtitle">
            Live records from MySQL database.
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
                      <span className={`risk-badge ${(place.risk_level || "low").toLowerCase()}`}>
                        {place.risk_level || "Low"}
                      </span>
                    </td>

                    <td>{place.police_station || "-"}</td>

                    <td>
                      <div className="action-group">
                        <button title="View">
                          <Eye size={16} />
                        </button>

                        <button title="Edit">
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
    </div>
  );
}

export default ReligiousPlaces;