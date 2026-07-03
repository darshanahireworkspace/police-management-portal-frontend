import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  Users,
  MapPin,
  Volume2,
  Route,
  ShieldAlert,
  Save,
  Navigation,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

import { getReligiousPlaces } from "../api/religiousPlaceApi";
import { createFestivalPermission } from "../api/festivalApi";
import VoiceField from "../components/common/VoiceField";

function AddFestivalPermission() {
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [photo, setPhoto] = useState(null);

  const [form, setForm] = useState({
    religious_place_id: "",
    festival_name: "Ganesh Utsav",
    festival_year: new Date().getFullYear(),
    organizer_name: "",
    president_name: "",
    president_mobile: "",
    permission_number: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    expected_crowd: "",
    sound_permission: "No",
    procession: "No",
    route_details: "",
    address: "",
    area: "",
    taluka: "",
    district: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    google_map_link: "",
    verification_status: "Pending",
    permission_status: "Pending",
    police_notes: "",
  });

  useEffect(() => {
    fetchPlaces();
    detectCurrentLocation();
  }, []);

  const fetchPlaces = async () => {
    try {
      const res = await getReligiousPlaces();
      setPlaces(res.data.data || []);
    } catch {
      toast.error("Failed to load religious places");
    }
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
        taluka:
          address.county ||
          address.city_district ||
          address.municipality ||
          "",
        district: address.state_district || address.county || "",
        state: address.state || "",
        pincode: address.postcode || "",
      }));
    } catch {
      toast.error("Address auto-fill failed");
    }
  };

  const detectCurrentLocation = () => {
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

        toast.success("Festival location detected");
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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.organizer_name.trim()) {
      toast.error("Mandal / Organizer name required");
      return;
    }

    if (!form.president_name.trim()) {
      toast.error("Adhyaksha name required");
      return;
    }

    if (!form.latitude || !form.longitude) {
      toast.error("Please detect event location");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (photo) {
        formData.append("photo", photo);
      }

      await createFestivalPermission(formData);

      toast.success("Festival permission saved successfully");
      navigate("/festival-permissions");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save permission");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlace = places.find(
    (p) => String(p.id) === String(form.religious_place_id)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Add Festival Permission</h2>
          <p className="page-subtitle">
            Temporary mandal / festival permission with live GPS verification.
          </p>
        </div>

        <button
          type="button"
          className="secondary-btn"
          onClick={detectCurrentLocation}
          disabled={locationLoading}
        >
          <Navigation size={18} />
          {locationLoading ? "Detecting..." : "Detect Current Location"}
        </button>
      </div>

      {form.latitude && form.longitude && (
        <div className="selected-location-box">
          <MapPin size={20} />
          <div>
            <h4>Festival Location Detected</h4>
            <p>
              {form.latitude}, {form.longitude}
            </p>
          </div>
        </div>
      )}

      {selectedPlace && (
        <div className="selected-location-box">
          <MapPin size={20} />
          <div>
            <h4>Linked Permanent Religious Place</h4>
            <p>
              {selectedPlace.place_name} • {selectedPlace.place_type} •{" "}
              {selectedPlace.area || "-"}
            </p>
          </div>
        </div>
      )}

      <form className="enterprise-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <div className="section-title">
            <CalendarCheck size={20} />
            <h3>Festival / Mandal Details</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Linked Permanent Place Optional</label>
              <select
                name="religious_place_id"
                value={form.religious_place_id}
                onChange={handleChange}
              >
                <option value="">No permanent place linked</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.place_name} - {place.place_type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Festival Name</label>
              <select name="festival_name" value={form.festival_name} onChange={handleChange}>
                <option>Ganesh Utsav</option>
                <option>Navratri</option>
                <option>Jayanti</option>
                <option>Holi</option>
                <option>Eid</option>
                <option>Urs</option>
                <option>Muharram</option>
                <option>Ram Navami</option>
                <option>Christmas</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mandal / Organizer Name</label>
              <VoiceField
                name="organizer_name"
                value={form.organizer_name}
                onChange={handleChange}
                placeholder="Example: Jai Ganesh Mandal"
              />
            </div>

            <div className="form-group">
              <label>Adhyaksha Name</label>
              <VoiceField
                name="president_name"
                value={form.president_name}
                onChange={handleChange}
                placeholder="Enter adhyaksha name"
              />
            </div>

            <div className="form-group">
              <label>Adhyaksha Mobile</label>
              <VoiceField
                name="president_mobile"
                value={form.president_mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
              />
            </div>

            <div className="form-group">
              <label>Expected Crowd</label>
              <VoiceField
                type="number"
                name="expected_crowd"
                value={form.expected_crowd}
                onChange={handleChange}
                placeholder="Example: 500"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="section-title">
            <MapPin size={20} />
            <h3>Auto Location Details</h3>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Full Address</label>
              <VoiceField name="address" value={form.address} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Area</label>
              <VoiceField name="area" value={form.area} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Taluka / City</label>
              <VoiceField name="taluka" value={form.taluka} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>District</label>
              <VoiceField name="district" value={form.district} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <VoiceField name="pincode" value={form.pincode} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Latitude</label>
              <VoiceField name="latitude" value={form.latitude} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Longitude</label>
              <VoiceField name="longitude" value={form.longitude} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="section-title">
            <Volume2 size={20} />
            <h3>Permission Details</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Sound Permission</label>
              <select name="sound_permission" value={form.sound_permission} onChange={handleChange}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label>Miravnuk / Procession</label>
              <select name="procession" value={form.procession} onChange={handleChange}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label>Permission Status</label>
              <select
                name="permission_status"
                value={form.permission_status}
                onChange={handleChange}
              >
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label>Verification Status</label>
              <select
                name="verification_status"
                value={form.verification_status}
                onChange={handleChange}
              >
                <option>Pending</option>
                <option>Verified</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="section-title">
            <Route size={20} />
            <h3>Route / Police Notes</h3>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Miravnuk Route Details</label>
              <VoiceField
                textarea
                name="route_details"
                value={form.route_details}
                onChange={handleChange}
                placeholder="Start point, route, end point"
              />
            </div>

            <div className="form-group full-width">
              <label>Police Notes</label>
              <VoiceField
                textarea
                name="police_notes"
                value={form.police_notes}
                onChange={handleChange}
                placeholder="Verification notes / conditions"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="section-title">
            <Upload size={20} />
            <h3>Photo</h3>
          </div>

          <label className="upload-box">
            <Upload size={30} />
            <h4>{photo ? photo.name : "Upload Mandal / Festival Photo"}</h4>
            <p>PNG / JPG</p>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setPhoto(e.target.files[0])}
            />
          </label>
        </section>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate("/festival-permissions")}>
            Cancel
          </button>

          <button type="submit" className="primary-btn" disabled={loading}>
            <Save size={18} />
            {loading ? "Saving..." : "Save Festival Permission"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddFestivalPermission;