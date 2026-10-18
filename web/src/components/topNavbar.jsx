import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronDown } from "lucide-react";

export default function TopNavbar({ logoUrl, placeholder }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();

  const toggleMenu = (menuName) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
  };

  const closeMenu = () => setActiveMenu(null);

  const handleNotificationsClick = () => {
    if (window.innerWidth < 768) {
      closeMenu();
      navigate("/notifications");
    } else {
      toggleMenu("notifications");
    }
  };

  const handleProfileClick = () => {
    if (window.innerWidth < 768) {
      closeMenu();
      navigate("/profile");
    } else {
      toggleMenu("profile");
    }
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

      {/* Grobot Logo */}
      <Link to="/" onClick={closeMenu} className="cursor-pointer">
        <img
          src={logoUrl}
          className="h-14 md:h-20 w-auto opacity-80 md:opacity-50 object-contain md:object-cover hover:opacity-95 transition-opacity"
          alt="Grobot logo"
        />
      </Link>

      {/* Right Controls */}
      <div className="mr-0 md:mr-5 flex flex-row items-center gap-3 md:gap-5">
        
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={handleNotificationsClick}
            aria-label="Notifications"
            className="size-11.5 md:size-14 flex items-center justify-center hover:bg-track bg-card rounded-full cursor-pointer transition-colors"
          >
            <Bell className="size-6 md:size-7 stroke-[2.25] md:stroke-[1.5]" strokeWidth={1.5} />
          </button>

          {activeMenu === "notifications" && (
            <div className="hidden md:flex absolute right-0 top-15 md:top-16 w-72 md:w-80 max-w-[calc(100vw-2rem)] bg-card rounded-2xl p-4 shadow-2xl z-50 flex-col gap-3">
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
            className="p-0.5 md:p-1 bg-card hover:bg-track rounded-full items-center flex flex-row cursor-pointer transition-colors"
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
            <div className="hidden md:flex absolute right-0 top-15 md:top-16 w-52 md:w-60 bg-card rounded-2xl p-3 shadow-2xl z-50 flex-col gap-1">
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