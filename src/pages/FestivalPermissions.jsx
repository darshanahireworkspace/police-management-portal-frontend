import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Download,
  CalendarDays,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getFestivalPermissions,
  deleteFestivalPermission,
} from "../api/festivalApi";
import VoiceField from "../components/common/VoiceField";

function FestivalPermissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

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
          <h2 className="page-title">
            Festival Permission Database
          </h2>

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

                  <td colSpan="7">
                    Loading...
                  </td>

                </tr>

              ) : filteredPermissions.length === 0 ? (

                <tr>

                  <td colSpan="7">
                    No Records Found
                  </td>

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

                    <td>

                      {item.place_name || "-"}

                    </td>

                    <td>

                      {item.organizer_name}

                    </td>

                    <td>

                      {item.expected_crowd}

                    </td>

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

                        <button>

                          <Eye size={16} />

                        </button>

                        <button>

                          <Pencil size={16} />

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

    </div>
  );
}

export default FestivalPermissions;