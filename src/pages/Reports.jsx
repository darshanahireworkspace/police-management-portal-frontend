import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Search,
  CalendarDays,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import { getReligiousPlaces } from "../api/religiousPlaceApi";
import { getFestivalPermissions } from "../api/festivalApi";
import VoiceField from "../components/common/VoiceField";

function Reports() {
  const [places, setPlaces] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  const loadData = async () => {
    try {
      const [placeRes, festivalRes] = await Promise.all([
        getReligiousPlaces(),
        getFestivalPermissions(),
      ]);

      setPlaces(placeRes.data.data || []);
      setFestivals(festivalRes.data.data || []);
    } catch {
      toast.error("Failed to load reports");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const highRisk = places.filter((p) => p.risk_level === "High");
  const pending = festivals.filter((f) => f.permission_status === "Pending");
  const approved = festivals.filter((f) => f.permission_status === "Approved");

  const reportRows =
    filter === "places"
      ? places
      : filter === "festivals"
      ? festivals
      : filter === "high"
      ? highRisk
      : filter === "pending"
      ? pending
      : [...places, ...festivals];

  const filteredReportRows = reportRows.filter((item) => {
    const q = searchText.toLowerCase();

    return (
      item.place_name?.toLowerCase().includes(q) ||
      item.organizer_name?.toLowerCase().includes(q) ||
      item.place_type?.toLowerCase().includes(q) ||
      item.festival_name?.toLowerCase().includes(q) ||
      item.area?.toLowerCase().includes(q) ||
      item.permission_status?.toLowerCase().includes(q) ||
      item.risk_level?.toLowerCase().includes(q) ||
      item.contact_mobile?.toLowerCase().includes(q) ||
      item.president_mobile?.toLowerCase().includes(q)
    );
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = filteredReportRows.map((item) => ({
      name: item.place_name || item.organizer_name || "-",
      type: item.place_type || item.festival_name || "-",
      area: item.area || "-",
      status: item.permission_status || item.risk_level || "-",
      mobile: item.contact_mobile || item.president_mobile || "-",
    }));

    const csv =
      "Name,Type,Area,Status,Mobile\n" +
      rows.map((r) => `${r.name},${r.type},${r.area},${r.status},${r.mobile}`).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "police-report.csv";
    a.click();

    toast.success("CSV exported");
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports & Export</h2>
          <p className="page-subtitle">
            Generate police reports for religious places, festival permissions, high-risk locations and pending verification.
          </p>
        </div>

        <div className="report-actions">
          <button className="secondary-btn" onClick={handlePrint}>
            <Printer size={18} />
            Print
          </button>

          <button className="primary-btn" onClick={handleExportCSV}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="report-summary-grid">
        <div className="report-card">
          <FileText size={22} />
          <div>
            <h3>{places.length}</h3>
            <p>Religious Places</p>
          </div>
        </div>

        <div className="report-card purple">
          <CalendarDays size={22} />
          <div>
            <h3>{festivals.length}</h3>
            <p>Festival Permissions</p>
          </div>
        </div>

        <div className="report-card red">
          <ShieldAlert size={22} />
          <div>
            <h3>{highRisk.length}</h3>
            <p>High Risk Places</p>
          </div>
        </div>

        <div className="report-card orange">
          <MapPin size={22} />
          <div>
            <h3>{pending.length}</h3>
            <p>Pending Permissions</p>
          </div>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="table-search">
          <Search size={18} />
          <VoiceField
            name="searchText"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search reports..."
          />
        </div>

        <select
          className="dashboard-filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Reports</option>
          <option value="places">Religious Places</option>
          <option value="festivals">Festival Permissions</option>
          <option value="high">High Risk</option>
          <option value="pending">Pending Permissions</option>
        </select>
      </div>

      <div className="data-table-card">
        <div className="table-responsive">
          <table className="professional-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type / Festival</th>
                <th>Area</th>
                <th>Status / Risk</th>
                <th>Contact</th>
              </tr>
            </thead>

            <tbody>
              {filteredReportRows.length === 0 ? (
                <tr>
                  <td colSpan="5">No report records found.</td>
                </tr>
              ) : (
                filteredReportRows.map((item, index) => (
                  <tr key={index}>
                    <td>{item.place_name || item.organizer_name || "-"}</td>
                    <td>{item.place_type || item.festival_name || "-"}</td>
                    <td>{item.area || "-"}</td>
                    <td>{item.permission_status || item.risk_level || "-"}</td>
                    <td>{item.contact_mobile || item.president_mobile || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;