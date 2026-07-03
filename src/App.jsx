import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddReligiousPlace from "./pages/AddReligiousPlace";
import ReligiousPlaces from "./pages/ReligiousPlaces";
import AddFestivalPermission from "./pages/AddFestivalPermission";
import FestivalPermissions from "./pages/FestivalPermissions";
import MapView from "./pages/MapView";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Officers from "./pages/Officers";
import Settings from "./pages/Settings";
import PoliceStations from "./pages/PoliceStations";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-religious-place" element={<AddReligiousPlace />} />
        <Route path="/religious-places" element={<ReligiousPlaces />} />
        <Route
          path="/add-festival-permission"
          element={<AddFestivalPermission />}
        />
        <Route
          path="/festival-permissions"
          element={<FestivalPermissions />}
        />
        <Route path="/map-view" element={<MapView />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/officers" element={<Officers />} />
        <Route path="/police-stations" element={<PoliceStations />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;