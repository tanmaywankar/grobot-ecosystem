import { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ChevronDown, ArrowLeft, Bell } from "lucide-react";
import RobotSelector from "./dashboard/RobotSelector.jsx";
import {
  INITIAL_DEVICES,
  getActiveDeviceId,
  setActiveDeviceId,
} from "../data/devices.js";

export default function TopNavbar({ logoUrl, placeholder }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isDashboard = location.pathname.startsWith("/dashboard");

  const urlId = searchParams.get("id");
  const selectedDeviceId =
    urlId && INITIAL_DEVICES.some((d) => d.id === urlId)
      ? urlId
      : getActiveDeviceId();

  const handleSelectDevice = (newId) => {
    setActiveDeviceId(newId);
    setSearchParams({ id: newId });
  };

  const toggleMenu = (menuName) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
  };

  const closeMenu = () => setActiveMenu(null);

  const handleNotificationsClick = () => {
    toggleMenu("notifications");
  };

  const handleProfileClick = () => {
    if (window.innerWidth < 768) {
      closeMenu();
      navigate("/profile");
    } else {
      toggleMenu("profile");
    }
  };

  const handleBackToDevices = () => {
    closeMenu();
    navigate("/devices");
  };

  return (
    <div className="relative w-full h-18 md:h-20 bg-cover flex flex-row justify-between items-center">
      {activeMenu && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 z-40"
          aria-hidden="true"
        />
      )}

      {/* Left Slot: Mobile Back Button on /dashboard, otherwise Grobot Logo */}
      <div className="flex items-center shrink-0 z-10">
        {isDashboard ? (
          <>
            {/* Accessible Mobile Back Arrow (< md) */}
            <button
              type="button"
              onClick={handleBackToDevices}
              aria-label="Back to devices list"
              className="md:hidden size-11.5 flex items-center justify-center bg-card hover:bg-track active:scale-95 text-text-main rounded-full cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-mint focus-visible:outline-none shadow-xs"
            >
              <ArrowLeft className="size-6 stroke-2" />
            </button>

            {/* Desktop Grobot Logo (md+) */}
            <Link
              to="/"
              onClick={closeMenu}
              aria-label="Grobot Home"
              className="hidden md:block cursor-pointer focus-visible:ring-2 focus-visible:ring-mint focus-visible:outline-none rounded-xl"
            >
              <img
                src={logoUrl}
                className="h-20 w-auto opacity-50 object-cover hover:opacity-95 transition-opacity"
                alt="Grobot logo"
              />
            </Link>
          </>
        ) : (
          <Link
            to="/"
            onClick={closeMenu}
            aria-label="Grobot Home"
            className="cursor-pointer focus-visible:ring-2 focus-visible:ring-mint focus-visible:outline-none rounded-xl"
          >
            <img
              src={logoUrl}
              className="h-14 md:h-20 w-auto opacity-80 md:opacity-50 object-contain md:object-cover hover:opacity-95 transition-opacity"
              alt="Grobot logo"
            />
          </Link>
        )}
      </div>

      {/* Robot Selector in Top Heading when on /dashboard */}
      {isDashboard && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-30">
          <RobotSelector
            devices={INITIAL_DEVICES}
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={handleSelectDevice}
          />
        </div>
      )}

      {/* Right Controls */}
      <div className="mr-0 md:mr-5 flex flex-row items-center gap-3 md:gap-5 shrink-0 z-10">
        
        {/* Notifications (Desktop & Tablet only - hidden on mobile) */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={handleNotificationsClick}
            aria-label="Notifications"
            className="size-11.5 md:size-14 flex items-center justify-center hover:bg-track bg-card rounded-full cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-mint focus-visible:outline-none"
          >
            <Bell className="size-6 md:size-7 stroke-[2.25] md:stroke-[1.5]" strokeWidth={1.5} />
          </button>

          {activeMenu === "notifications" && (
            <div className="hidden md:flex absolute right-0 top-15 md:top-16 w-72 md:w-80 max-w-[calc(100vw-2rem)] bg-card rounded-2xl p-4 shadow-2xl z-50 flex-col gap-3 border border-placeholder/20">
              <div className="flex items-center justify-between pb-2">
                <Link
                  to="/notifications"
                  onClick={closeMenu}
                  className="text-sm font-medium text-text-main hover:text-mint transition-colors"
                >
                  Notifications
                </Link>
                <span className="text-xs text-text-muted hover:text-text-main cursor-pointer">
                  Mark all as read
                </span>
              </div>
              <div className="py-6 text-center text-xs text-text-muted bg-track rounded-xl">
                No new notifications
              </div>
              <Link
                to="/notifications"
                onClick={closeMenu}
                className="text-center text-xs text-mint hover:underline pt-1"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={handleProfileClick}
            aria-label="User profile"
            className="p-0.5 md:p-1 bg-card hover:bg-track rounded-full items-center flex flex-row cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-mint focus-visible:outline-none"
          >
            <img
              src={placeholder}
              alt="userplaceholder"
              className="size-10 md:size-11 rounded-full border-[2.5px] md:border-4 border-mint object-cover"
            />
            <ChevronDown
              strokeWidth={1.5}
              className={`size-5 md:size-7 stroke-[2.25] md:stroke-[1.5] ml-0.5 md:ml-1 transition-transform duration-200 hidden md:inline-block ${
                activeMenu === "profile" ? "rotate-180" : ""
              }`}
            />
          </button>

          {activeMenu === "profile" && (
            <div className="hidden md:flex absolute right-0 top-15 md:top-16 w-56 md:w-64 bg-card rounded-2xl p-3 shadow-2xl z-50 flex-col gap-1 border border-placeholder/20">
              <Link
                to="/profile"
                onClick={closeMenu}
                className="px-3 py-2 hover:bg-track rounded-xl transition-colors"
              >
                <p className="text-sm font-medium text-text-main">My Account</p>
                <p className="text-xs text-text-muted truncate">user@grobot.io</p>
              </Link>

              <div className="h-0.5 bg-track rounded-full my-1" />

              <Link
                to="/notifications"
                onClick={closeMenu}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-track rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Bell size={16} strokeWidth={1.75} />
                  <span>Notifications</span>
                </div>
              </Link>

              <Link
                to="/profile"
                onClick={closeMenu}
                className="w-full text-left px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-track rounded-xl transition-colors cursor-pointer"
              >
                Profile Details
              </Link>
              <Link
                to="/profile"
                onClick={closeMenu}
                className="w-full text-left px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-track rounded-xl transition-colors cursor-pointer"
              >
                Preferences
              </Link>

              <div className="h-0.5 bg-track rounded-full my-1" />

              <button
                type="button"
                onClick={closeMenu}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-track rounded-xl transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
