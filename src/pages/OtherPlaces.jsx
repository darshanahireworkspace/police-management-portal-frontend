import { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2, X, Phone, MapPin, Store, Search } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  createOtherPlace,
  getOtherPlaces,
  getSingleOtherPlace,
  updateOtherPlace,
  deleteOtherPlace,
} from "../api/otherPlaceApi";

import VoiceField from "../components/common/VoiceField";
import { addToOfflineQueue } from "../services/offlineQueue";

function OtherPlaces() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedOther, setSelectedOther] = useState(null);

  const [form, setForm] = useState({
    place_name: "",
    category: "Hotel",
    owner_name: "",
    mobile: "",
    address: "",
    area: "",
    latitude: "",
    longitude: "",
    google_map_link: "",
    notes: "",
  });

  const loadPlaces = async () => {
    try {
      const res = await getOtherPlaces();
      setPlaces(res.data.data || []);
    } catch {
      toast.error("Failed to load other places");
    }
  };

  useEffect(() => {
    loadPlaces();
    detectLocation();
  }, []);

  useEffect(() => {
    const loadSingle = async () => {
      if (!id) return;

      try {
        const res = await getSingleOtherPlace(id);
        const data = res.data.data;

        setForm({
          place_name: data.place_name || "",
          category: data.category || "Hotel",
          owner_name: data.owner_name || "",
          mobile: data.mobile || "",
          address: data.address || "",
          area: data.area || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
          google_map_link: data.google_map_link || "",
          notes: data.notes || "",
        });
      } catch {
        toast.error("Failed to load record");
      }
    };

    loadSingle();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );

      const data = await res.json();
      const address = data.address || {};

      setForm((prev) => ({
        ...prev,
        address: data.display_name || "",
        area:
          address.suburb ||
          address.neighbourhood ||
          address.road ||
          address.village ||
          address.town ||
          "",
      }));
    } catch {
      toast.error("Address auto-fill failed");
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location not supported");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(7);
        const lng = position.coords.longitude.toFixed(7);

        setForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          google_map_link: `https://www.google.com/maps?q=${lat},${lng}`,
        }));

        await reverseGeocode(lat, lng);
        setLocationLoading(false);
      },
      () => {
        toast.error("Please allow location permission");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.place_name.trim()) {
      toast.error("Name required");
      return;
    }

    if (!form.category.trim()) {
      toast.error("Category required");
      return;
    }

    try {
      if (isEditMode) {
        await updateOtherPlace(id, form);
        toast.success("Other place updated successfully");
        navigate("/other-places");
      } else {
        await createOtherPlace(form);
        toast.success("Other city place added");

        setForm({
          place_name: "",
          category: "Hotel",
          owner_name: "",
          mobile: "",
          address: "",
          area: "",
          latitude: form.latitude,
          longitude: form.longitude,
          google_map_link: form.google_map_link,
          notes: "",
        });

        loadPlaces();
      }
    } catch {
      if (!navigator.onLine) {
        await addToOfflineQueue({
          method: "POST",
          url: "/other-places",
          data: form,
        });

        toast.success("Saved offline. It will sync when internet returns.");
        return;
      }

      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      await deleteOtherPlace(id);
      toast.success("Deleted");
      loadPlaces();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredPlaces = places.filter((item) => {
    const q = search.toLowerCase();

    return (
      item.place_name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.area?.toLowerCase().includes(q) ||
      item.mobile?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Other City Data</h2>
          <p className="page-subtitle">
            Store hotels, medicals, shops, amruttulya, mobile shops and other city information.
          </p>
        </div>

        <button className="secondary-btn" type="button" onClick={detectLocation}>
          <MapPin size={18} />
          {locationLoading ? "Detecting..." : "Detect Location"}
        </button>
      </div>

      <form className="form-section" onSubmit={handleSubmit}>
        <div className="section-title">
          <Store size={20} />
          <h3>{isEditMode ? "Edit Other Place" : "Add Other Place"}</h3>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <VoiceField
              name="place_name"
              value={form.place_name}
              onChange={handleChange}
              placeholder="Example: Sai Amruttulya"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option>Amruttulya</option>
              <option>Hotel</option>
              <option>Medical</option>
              <option>Mobile Shop</option>
              <option>Cloth Shop</option>
              <option>Grocery</option>
              <option>Garage</option>
              <option>School</option>
              <option>Hospital</option>
              <option>ATM</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Owner / Contact Person</label>
            <VoiceField
              name="owner_name"
              value={form.owner_name}
              onChange={handleChange}
              placeholder="Owner name"
            />
          </div>

          <div className="form-group">
            <label>Mobile</label>
            <VoiceField
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Mobile number"
            />
          </div>

          <div className="form-group full-width">
            <label>Address</label>
            <VoiceField
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Auto-filled address"
            />
          </div>

          <div className="form-group">
            <label>Area</label>
            <VoiceField
              name="area"
              value={form.area}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Latitude</label>
            <VoiceField
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <VoiceField
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label>Notes</label>
            <VoiceField
              textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any important notes"
            />
          </div>
        </div>

        <button className="primary-btn" type="submit">
          <Plus size={18} />
          {isEditMode ? "Update Other Place" : "Save Other Place"}
        </button>
      </form>

      <div className="table-toolbar">
        <div className="table-search">
          <Search size={18} />
          <VoiceField
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search other city data..."
          />
        </div>
      </div>

      <div className="data-table-card">
        <div className="table-responsive">
          <table className="professional-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Area</th>
                <th>Mobile</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredPlaces.length === 0 ? (
                <tr>
                  <td colSpan="6">No records found.</td>
                </tr>
              ) : (
                filteredPlaces.map((item) => (
                  <tr key={item.id}>
                    <td>{item.place_name}</td>
                    <td>{item.category}</td>
                    <td>{item.area || "-"}</td>
                    <td>{item.mobile || "-"}</td>
                    <td>{item.address || "-"}</td>
                    <td>
                      <div className="action-group">
                        <button onClick={() => setSelectedOther(item)}>
                          <Eye size={16} />
                        </button>

                        <button onClick={() => navigate(`/edit-other-place/${item.id}`)}>
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

      {selectedOther && (
        <div className="record-modal-overlay" onClick={() => setSelectedOther(null)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()}>
            <div className="record-modal-header">
              <div>
                <span>Other City Data</span>
                <h2>{selectedOther.place_name}</h2>
                <p>{selectedOther.category} • {selectedOther.area || "-"}</p>
              </div>

              <button className="record-modal-close" onClick={() => setSelectedOther(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="record-detail-grid">
              <div className="detail-card">
                <label>Name</label>
                <span>{selectedOther.place_name || "-"}</span>
              </div>

              <div className="detail-card">
                <label>Category</label>
                <span>{selectedOther.category || "-"}</span>
              </div>

              <div className="detail-card">
                <label>Owner</label>
                <span>{selectedOther.owner_name || "-"}</span>
              </div>

              <div className="detail-card">
                <label>Mobile</label>
                <span>{selectedOther.mobile || "-"}</span>
              </div>

              <div className="detail-card">
                <label>Area</label>
                <span>{selectedOther.area || "-"}</span>
              </div>

              <div className="detail-card">
                <label>Address</label>
                <span>{selectedOther.address || "-"}</span>
              </div>

              <div className="detail-card">
                <label>Latitude</label>
                <span>{selectedOther.latitude || "-"}</span>
              </div>

              <div className="detail-card">
                <label>Longitude</label>
                <span>{selectedOther.longitude || "-"}</span>
              </div>
            </div>

            <div className="modal-buttons">
              {selectedOther.google_map_link && (
                <a
                  className="modal-btn btn-map"
                  href={selectedOther.google_map_link}
                  target="_blank"
                >
                  <MapPin size={17} />
                  Open Map
                </a>
              )}

              {selectedOther.mobile && (
                <a className="modal-btn btn-call" href={`tel:${selectedOther.mobile}`}>
                  <Phone size={17} />
                  Call
                </a>
              )}

              <button
                className="modal-btn btn-edit"
                onClick={() => navigate(`/edit-other-place/${selectedOther.id}`)}
              >
                <Pencil size={17} />
                Edit
              </button>

              <button className="modal-btn btn-close" onClick={() => setSelectedOther(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OtherPlaces;