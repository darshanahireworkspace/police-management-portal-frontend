import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Users,
  ShieldAlert,
  Upload,
  Save,
  Navigation,
} from "lucide-react";
import toast from "react-hot-toast";

import { createReligiousPlace } from "../api/religiousPlaceApi";
import { getPoliceStations } from "../api/policeStationApi";
import VoiceField from "../components/common/VoiceField";

function AddReligiousPlace() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [policeStations, setPoliceStations] = useState([]);

  const [form, setForm] = useState({
    place_name: "",
    religion: "Hindu",
    place_type: "Temple",

    address: "",
    area: "",
    taluka: "",
    district: "",
    state: "",
    pincode: "",

    latitude: "",
    longitude: "",
    google_map_link: "",

    police_station: "",

    contact_person: "",
    contact_mobile: "",

    regular_crowd: "Low",
    risk_level: "Low",

    sensitive_notes: "",
  });

  useEffect(() => {
    loadPoliceStations();
    detectCurrentLocation();
  }, []);

  const loadPoliceStations = async () => {
    try {
      const res = await getPoliceStations();
      setPoliceStations(res.data.data || []);
    } catch {
      toast.error("Failed to load police stations");
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
        address: data.display_name || prev.address,
        area:
          address.suburb ||
          address.neighbourhood ||
          address.road ||
          address.village ||
          address.town ||
          prev.area,
        taluka:
          address.county ||
          address.city_district ||
          address.municipality ||
          prev.taluka,
        district: address.state_district || address.county || prev.district,
        state: address.state || prev.state,
        pincode: address.postcode || prev.pincode,
      }));
    } catch {
      toast.error("Address auto-fill failed. You can enter manually.");
    }
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location not supported in this browser");
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

        toast.success("Current location detected");
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

    if (!form.place_name.trim()) {
      toast.error("Place name required");
      return;
    }

    if (!form.latitude || !form.longitude) {
      toast.error("Please detect location first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      formData.append("special_day_crowd", form.regular_crowd);

      if (image) {
        formData.append("image", image);
      }

      await createReligiousPlace(formData);

      toast.success("Religious place saved successfully");
      navigate("/religious-places");
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("This place already exists");
      } else {
        toast.error(error.response?.data?.message || "Failed to save record");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Add Religious Place</h2>
          <p className="page-subtitle">
            Location will auto-detect and address details will auto-fill.
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
            <h4>Location Detected</h4>
            <p>
              {form.latitude}, {form.longitude}
            </p>
          </div>
        </div>
      )}

      <form className="enterprise-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <div className="section-title">
            <Building2 size={20} />
            <h3>Basic Details</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Place Name</label>
              <VoiceField
                name="place_name"
                value={form.place_name}
                onChange={handleChange}
                placeholder="Enter temple / masjid / dargah name"
              />
            </div>

            <div className="form-group">
              <label>Place Type</label>
              <select name="place_type" value={form.place_type} onChange={handleChange}>
                <option value="Temple">Temple / Mandir</option>
                <option value="Masjid">Masjid</option>
                <option value="Dargah">Dargah</option>
                <option value="Gurudwara">Gurudwara</option>
                <option value="Church">Church</option>
                <option value="Math">Math</option>
                <option value="Ashram">Ashram</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Religion</label>
              <select name="religion" value={form.religion} onChange={handleChange}>
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Sikh">Sikh</option>
                <option value="Jain">Jain</option>
                <option value="Buddhist">Buddhist</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Police Station</label>
              <select
                name="police_station"
                value={form.police_station}
                onChange={handleChange}
              >
                <option value="">Select Police Station</option>
                {policeStations.map((station) => (
                  <option key={station.id} value={station.station_name}>
                    {station.station_name}
                  </option>
                ))}
              </select>
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
              <VoiceField
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Auto filled address"
              />
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
              <label>State</label>
              <VoiceField name="state" value={form.state} onChange={handleChange} />
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
            <Users size={20} />
            <h3>Contact Details</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Contact Person</label>
              <VoiceField
                name="contact_person"
                value={form.contact_person}
                onChange={handleChange}
                placeholder="Enter contact person name"
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <VoiceField
                name="contact_mobile"
                value={form.contact_mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="section-title">
            <ShieldAlert size={20} />
            <h3>Police Risk Details</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Regular Crowd</label>
              <select
                name="regular_crowd"
                value={form.regular_crowd}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Risk Level</label>
              <select name="risk_level" value={form.risk_level} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <VoiceField
                textarea
                name="sensitive_notes"
                value={form.sensitive_notes}
                onChange={handleChange}
                placeholder="Any important police notes"
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
            <h4>{image ? image.name : "Upload Place Photo"}</h4>
            <p>PNG / JPG</p>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>
        </section>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate("/religious-places")}>
            Cancel
          </button>

          <button type="submit" className="primary-btn" disabled={loading}>
            <Save size={18} />
            {loading ? "Saving..." : "Save Record"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddReligiousPlace;