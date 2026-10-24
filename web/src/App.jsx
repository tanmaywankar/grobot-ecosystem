import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./layouts/rootLayout.jsx";
import DevicesView from "./views/devicesView.jsx";
import DashboardView from "./views/dashboardView.jsx";
import SettingsView from "./views/settingsView.jsx";
import SupportView from "./views/supportView.jsx";
import NotificationsView from "./views/notificationsView.jsx";
import ProfileView from "./views/profileView.jsx";
import LoginView from "./views/loginView.jsx";
import SignupView from "./views/signupView.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Full-screen Auth Pages (without dashboard navbars) */}
        <Route path="/login" element={<LoginView />} />
        <Route path="/signup" element={<SignupView />} />

        {/* Protected Dashboard & App Pages (with RootLayout navbars) */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Navigate to="/devices" replace />} />
          <Route path="devices" element={<DevicesView />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="support" element={<SupportView />} />
          <Route path="notifications" element={<NotificationsView />} />
          <Route path="profile" element={<ProfileView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
