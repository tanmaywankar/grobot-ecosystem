import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronDown } from "lucide-react";

export default function TopNavbar({ logoUrl, placeholder }) {
  const [activeMenu, setActiveMenu] = useState(null); 
  const toggleMenu = (menuName) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
  };

  const closeMenu = () => setActiveMenu(null);

  return (
    <div className="relative w-full h-20 bg-cover flex flex-row justify-between items-center">
      {/* Click-outside backdrop */}
      {activeMenu && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 z-40"
          aria-hidden="true"
        />
      )}

      {/* Grobot Logo */}
      <Link to="/" onClick={closeMenu} className="cursor-pointer">
        <img
          src={logoUrl}
          className="h-20 w-max opacity-50 object-cover hover:opacity-80 transition-opacity"
          alt="Grobot logo"
        />
      </Link>

      {/* Right Controls */}
      <div className="mr-5 flex flex-row items-center gap-5">
        
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("notifications")}
            className="size-14 flex items-center justify-center hover:bg-track bg-card rounded-full cursor-pointer transition-colors"
          >
            <Bell size={28} strokeWidth={1.5} />
          </button>

          {activeMenu === "notifications" && (
            <div className="absolute right-0 top-16 w-80 bg-card rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-medium text-text-main">Notifications</span>
                <span className="text-xs text-text-muted hover:text-text-main cursor-pointer">Mark all as read</span>
              </div>
              <div className="py-6 text-center text-xs text-text-muted bg-track rounded-xl">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("profile")}
            className="p-1 bg-card hover:bg-track rounded-full items-center flex flex-row cursor-pointer transition-colors"
          >
            <img
              src={placeholder}
              alt="userplaceholder"
              className="size-11 rounded-full border-4 border-mint object-cover"
            />
            <ChevronDown
              size={28}
              strokeWidth={1.5}
              className={`ml-1 transition-transform duration-200 ${
                activeMenu === "profile" ? "rotate-180" : ""
              }`}
            />
          </button>

          {activeMenu === "profile" && (
            <div className="absolute right-0 top-16 w-60 bg-card rounded-2xl p-3 shadow-2xl z-50 flex flex-col gap-1">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-text-main">My Account</p>
                <p className="text-xs text-text-muted truncate">user@grobot.io</p>
              </div>

              <div className="h-0.5 bg-track rounded-full my-1" />

              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-track rounded-xl transition-colors cursor-pointer"
              >
                Profile Details
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-track rounded-xl transition-colors cursor-pointer"
              >
                Preferences
              </button>

              <div className="h-0.5 bg-track rounded-full my-1" />

              <button
                type="button"
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