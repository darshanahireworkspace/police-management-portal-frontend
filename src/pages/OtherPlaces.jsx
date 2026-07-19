import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Phone,
  MapPin,
  Store,
  Search,
  ImagePlus,
  Upload,
} from "lucide-react";
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

const INITIAL_FORM = {
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
  photo: "",
};

function OtherPlaces() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedOther, setSelectedOther] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const getPhotoUrl = (photo) => {
    if (!photo) return "";

    if (
      photo.startsWith("http://") ||
      photo.startsWith("https://") ||
      photo.startsWith("blob:") ||
      photo.startsWith("data:")
    ) {
      return photo;
    }

    const backendBase = (import.meta.env.VITE_API_URL || "").replace(
      /\/api\/?$/,
      ""
    );

    const cleanPhoto = photo
      .replace(/^\/+/, "")
      .replace(/^uploads\//, "");

    return `${backendBase}/uploads/${cleanPhoto}`;
  };

  const loadPlaces = async () => {
    try {
      const res = await getOtherPlaces();
      setPlaces(res.data.data || []);
    } catch (error) {
      console.error("Other places load error:", error);
      toast.error("Failed to load other places");
    }
  };

  useEffect(() => {
    loadPlaces();

    if (!isEditMode) {
      detectLocation();
    }
  }, []);

  useEffect(() => {
    const loadSingle = async () => {
      if (!id) return;

      try {
        const res = await getSingleOtherPlace(id);
        const data = res.data.data;

        const existingPhoto = data.photo || data.image || "";

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
          photo: existingPhoto,
        });

        setPhotoPreview(getPhotoUrl(existingPhoto));
      } catch (error) {
        console.error("Single other place error:", error);
        toast.error("Failed to load record");
      }
    };

    loadSingle();
  }, [id]);

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG or WEBP photo is allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo size must be below 5 MB");
      e.target.value = "";
      return;
    }

    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removeSelectedPhoto = () => {
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(null);
    setPhotoPreview("");
    setForm((previous) => ({
      ...previous,
      photo: "",
    }));
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );

      const data = await res.json();
      const address = data.address || {};

      setForm((previous) => ({
        ...previous,
        address: data.display_name || "",
        area:
          address.suburb ||
          address.neighbourhood ||
          address.road ||
          address.village ||
          address.town ||
          address.city ||
          "",
      }));
    } catch (error) {
      console.error("Reverse geocode error:", error);
      toast.error("Address auto-fill failed");
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported on this device");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(7);
        const lng = position.coords.longitude.toFixed(7);

        setForm((previous) => ({
          ...previous,
          latitude: lat,
          longitude: lng,
          google_map_link: `https://www.google.com/maps?q=${lat},${lng}`,
        }));

        await reverseGeocode(lat, lng);

        setLocationLoading(false);
        toast.success("Current location detected");
      },
      (error) => {
        console.error("Location error:", error);

        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Please allow location permission");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error("Current location is unavailable");
        } else {
          toast.error("Location detection timed out");
        }

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  const createFormData = () => {
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key !== "photo") {
        formData.append(key, value ?? "");
      }
    });

    if (photoFile) {
      formData.append("photo", photoFile);
    }

    if (isEditMode) {
      formData.append("existing_photo", form.photo || "");
    }

    return formData;
  };

  const resetForm = () => {
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setForm({
      ...INITIAL_FORM,
      latitude: form.latitude,
      longitude: form.longitude,
      google_map_link: form.google_map_link,
      address: form.address,
      area: form.area,
    });

    setPhotoFile(null);
    setPhotoPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.place_name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!form.category.trim()) {
      toast.error("Category is required");
      return;
    }

    if (!form.latitude || !form.longitude) {
      toast.error("Please detect the current location");
      return;
    }

    try {
      setSubmitting(true);

      const payload = createFormData();

      if (isEditMode) {
        await updateOtherPlace(id, payload);

        toast.success("Other place updated successfully");
        navigate("/other-places");
      } else {
        await createOtherPlace(payload);

        toast.success("Other city place added successfully");
        resetForm();
        await loadPlaces();
      }
    } catch (error) {
      console.error("Other place save error:", error);

      if (!navigator.onLine) {
        const offlineData = {
          ...form,
          photo: "",
        };

        await addToOfflineQueue({
          method: "POST",
          url: "/other-places",
          data: offlineData,
        });

        toast.success(
          photoFile
            ? "Details saved offline. Photo requires internet and was not queued."
            : "Saved offline. It will sync when internet returns."
        );

        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to save other place"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Delete this record permanently?")) return;

    try {
      await deleteOtherPlace(recordId);
      toast.success("Record deleted");
      setSelectedOther(null);
      await loadPlaces();
    } catch (error) {
      console.error("Other place delete error:", error);
      toast.error("Delete failed");
    }
  };

  const filteredPlaces = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return places;

    return places.filter((item) => {
      const searchableText = `
        ${item.place_name || ""}
        ${item.category || ""}
        ${item.owner_name || ""}
        ${item.area || ""}
        ${item.mobile || ""}
        ${item.address || ""}
      `.toLowerCase();

      return searchableText.includes(q);
    });
  }, [places, search]);

  return (
    <div className="other-places-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Other City Data</h2>

          <p className="page-subtitle">
            Store hotels, medicals, shops, Amruttulya, mobile shops and other
            important city information.
          </p>
        </div>

        <button
          className="secondary-btn"
          type="button"
          onClick={detectLocation}
          disabled={locationLoading}
        >
          <MapPin size={18} />

          {locationLoading ? "Detecting..." : "Detect Location"}
        </button>
      </div>

      <form
        className="form-section other-place-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
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

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
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
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Mobile number"
            />
          </div>

          <div className="form-group full-width">
            <label>Address</label>

            <VoiceField
              textarea
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
              placeholder="Area or locality"
            />
          </div>

          <div className="form-group">
            <label>Latitude</label>

            <VoiceField
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="Latitude"
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>

            <VoiceField
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="Longitude"
            />
          </div>

          <div className="form-group full-width">
            <label>Shop / Place Photo</label>

            <div className="photo-upload-card">
              {!photoPreview ? (
                <label className="photo-upload-empty">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    hidden
                  />

                  <div className="photo-upload-icon">
                    <ImagePlus size={28} />
                  </div>

                  <div>
                    <b>Upload place photo</b>
                    <span>JPG, PNG or WEBP — maximum 5 MB</span>
                  </div>

                  <div className="photo-upload-action">
                    <Upload size={17} />
                    Choose Photo
                  </div>
                </label>
              ) : (
                <div className="photo-preview-box">
                  <img src={photoPreview} alt="Other place preview" />

                  <div className="photo-preview-actions">
                    <label className="photo-change-btn">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        hidden
                      />

                      <Upload size={16} />
                      Change Photo
                    </label>

                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={removeSelectedPhoto}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
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

        <button
          className="primary-btn"
          type="submit"
          disabled={submitting}
        >
          <Plus size={18} />

          {submitting
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : isEditMode
              ? "Update Other Place"
              : "Save Other Place"}
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
                <th>Photo</th>
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
                  <td colSpan="7">No records found.</td>
                </tr>
              ) : (
                filteredPlaces.map((item) => {
                  const itemPhoto = getPhotoUrl(item.photo || item.image);

                  return (
                    <tr key={item.id}>
                      <td>
                        {itemPhoto ? (
                          <img
                            className="other-table-photo"
                            src={itemPhoto}
                            alt={item.place_name}
                          />
                        ) : (
                          <div className="other-table-photo-placeholder">
                            <Store size={18} />
                          </div>
                        )}
                      </td>

                      <td>{item.place_name}</td>
                      <td>{item.category}</td>
                      <td>{item.area || "-"}</td>
                      <td>{item.mobile || "-"}</td>
                      <td>{item.address || "-"}</td>

                      <td>
                        <div className="action-group">
                          <button
                            type="button"
                            title="View details"
                            onClick={() => setSelectedOther(item)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title="Edit record"
                            onClick={() =>
                              navigate(`/edit-other-place/${item.id}`)
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            title="Delete record"
                            className="danger-action"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOther && (
        <div
          className="record-modal-overlay"
          onClick={() => setSelectedOther(null)}
        >
          <div
            className="record-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="record-modal-header">
              <div>
                <span>Other City Data</span>
                <h2>{selectedOther.place_name}</h2>

                <p>
                  {selectedOther.category} • {selectedOther.area || "-"}
                </p>
              </div>

              <button
                type="button"
                className="record-modal-close"
                onClick={() => setSelectedOther(null)}
              >
                <X size={20} />
              </button>
            </div>

            {(selectedOther.photo || selectedOther.image) && (
              <div className="record-photo-banner">
                <img
                  src={getPhotoUrl(
                    selectedOther.photo || selectedOther.image
                  )}
                  alt={selectedOther.place_name}
                />
              </div>
            )}

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

              <div className="detail-card full-detail-card">
                <label>Notes</label>
                <span>{selectedOther.notes || "-"}</span>
              </div>
            </div>

            <div className="modal-buttons">
              {selectedOther.google_map_link && (
                <a
                  className="modal-btn btn-map"
                  href={selectedOther.google_map_link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin size={17} />
                  Open Map
                </a>
              )}

              {selectedOther.mobile && (
                <a
                  className="modal-btn btn-call"
                  href={`tel:${selectedOther.mobile}`}
                >
                  <Phone size={17} />
                  Call
                </a>
              )}

              <button
                type="button"
                className="modal-btn btn-edit"
                onClick={() =>
                  navigate(`/edit-other-place/${selectedOther.id}`)
                }
              >
                <Pencil size={17} />
                Edit
              </button>

              <button
                type="button"
                className="modal-btn btn-close"
                onClick={() => setSelectedOther(null)}
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

export default OtherPlaces;