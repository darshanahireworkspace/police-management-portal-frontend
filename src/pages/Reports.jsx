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
    const printArea = document.getElementById("professional-report-print");

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Chhavani Police Station Report</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 30px;
              color: #0f172a;
              background: #ffffff;
            }

            .report-header {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 18px;
              border-bottom: 3px solid #0b3d91;
              padding-bottom: 18px;
              margin-bottom: 24px;
            }

            .report-header img {
              width: 82px;
              height: 82px;
              object-fit: contain;
            }

            .report-header h1 {
              margin: 0;
              font-size: 30px;
              font-weight: 900;
              color: #0b1f3a;
              text-transform: uppercase;
            }

            .report-header h2 {
              margin: 6px 0 0;
              font-size: 18px;
              color: #0b3d91;
              text-align: center;
            }

            .report-meta {
              display: flex;
              justify-content: space-between;
              margin-bottom: 22px;
              font-size: 13px;
              color: #475569;
            }

            .report-title {
              background: #eef6ff;
              border-left: 5px solid #0b3d91;
              padding: 14px 18px;
              border-radius: 10px;
              margin-bottom: 22px;
            }

            .report-title h3 {
              margin: 0;
              font-size: 22px;
              color: #0f172a;
            }

            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 14px;
              margin-bottom: 25px;
            }

            .summary-card {
              border: 1px solid #dbeafe;
              border-radius: 14px;
              padding: 16px;
              background: #f8fafc;
            }

            .summary-card b {
              display: block;
              font-size: 26px;
              color: #0b3d91;
              margin-bottom: 5px;
            }

            .summary-card span {
              font-size: 13px;
              font-weight: 700;
              color: #475569;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }

            th {
              background: #0b3d91;
              color: white;
              padding: 12px;
              font-size: 13px;
              text-align: left;
            }

            td {
              padding: 11px 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
            }

            tr:nth-child(even) {
              background: #f8fafc;
            }

            .footer {
              margin-top: 45px;
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              color: #475569;
            }

            .sign {
              text-align: center;
              margin-top: 50px;
            }

            .sign-line {
              width: 180px;
              border-top: 1px solid #0f172a;
              margin: 0 auto 8px;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>

        <body>
          <div class="report-header">
            <img src="/police-logo.png" />
            <div>
              <h1>Chhavani Police Station</h1>
              <h2>Malegaon City Police Management System</h2>
            </div>
          </div>

          <div class="report-meta">
            <span><b>Date:</b> ${new Date().toLocaleString()}</span>
            <span><b>Generated By:</b> Police Officer</span>
          </div>

          ${printArea.innerHTML}

          <div class="footer">
            <span>Generated by Police City Management System</span>

            <div class="sign">
              <div class="sign-line"></div>
              <b>Officer Signature</b>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
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
      rows
        .map((r) => `${r.name},${r.type},${r.area},${r.status},${r.mobile}`)
        .join("\n");

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
            Generate police reports for religious places, festival permissions,
            high-risk locations and pending verification.
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

      <div id="professional-report-print">
        <div className="report-title">
          <h3>Reports & Export</h3>
          <p>
            Police report for religious places, festival permissions, high-risk
            locations and pending verification.
          </p>
        </div>

        <div className="summary-grid report-summary-grid">
          <div className="summary-card report-card">
            <FileText size={22} />
            <div>
              <b>{places.length}</b>
              <span>Religious Places</span>
            </div>
          </div>

          <div className="summary-card report-card purple">
            <CalendarDays size={22} />
            <div>
              <b>{festivals.length}</b>
              <span>Festival Permissions</span>
            </div>
          </div>

          <div className="summary-card report-card red">
            <ShieldAlert size={22} />
            <div>
              <b>{highRisk.length}</b>
              <span>High Risk Places</span>
            </div>
          </div>

          <div className="summary-card report-card orange">
            <MapPin size={22} />
            <div>
              <b>{pending.length}</b>
              <span>Pending Permissions</span>
            </div>
          </div>
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
                      <td>
                        {item.contact_mobile || item.president_mobile || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;