import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./layouts/rootLayout.jsx";
import DevicesView from "./views/devicesView.jsx";
import DashboardView from "./views/dashboardView.jsx";
import SettingsView from "./views/settingsView.jsx";
import SupportView from "./views/supportView.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Navigate to="/devices" replace />} />
          <Route path="devices" element={<DevicesView />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="support" element={<SupportView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}