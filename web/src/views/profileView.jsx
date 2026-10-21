import { Link } from "react-router-dom";
import { Bell, User, Sliders, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import placeholder from "../assets/accountPlaceholder.png";

export default function ProfileView() {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 select-none pb-12 pt-2 md:pt-4">
      <h1 className="text-2xl md:text-3xl font-medium text-text-main tracking-tight">
        My Account
      </h1>

      {/* User Info Card */}
      <div className="bg-[#1F211F] rounded-3xl p-5 md:p-6 shadow-md flex items-center gap-4">
        <img
          src={placeholder}
          alt="User Profile"
          className="size-16 rounded-full border-[3px] border-mint object-cover"
        />
        <div className="flex flex-col min-w-0">
          <h2 className="text-lg md:text-xl font-medium text-text-main truncate">
            Grobot User
          </h2>
          <span className="text-sm font-light text-text-muted truncate">
            user@grobot.io
          </span>
          <span className="text-xs font-light text-mint mt-0.5">
            Pro Plan • Active
          </span>
        </div>
      </div>

      {/* Account Settings List */}
      <div className="bg-[#1F211F] rounded-3xl p-2 shadow-md flex flex-col divide-y divide-[#2A2E2A]">
        {/* Notifications (Primary Item on Android) */}
        <Link
          to="/notifications"
          className="flex items-center justify-between p-4 hover:bg-[#272B27] rounded-2xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-2xl bg-[#292D29] flex items-center justify-center text-mint group-hover:scale-105 transition-transform">
              <Bell size={20} strokeWidth={1.75} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium text-text-main">
                Notifications
              </span>
              <span className="text-xs font-light text-text-muted">
                Device alerts & telemetry warnings
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-text-muted group-hover:text-text-main transition-colors" />
        </Link>

        {/* Profile Details */}
        <div className="flex items-center justify-between p-4 hover:bg-[#272B27] rounded-2xl transition-colors cursor-pointer group">
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-2xl bg-[#292D29] flex items-center justify-center text-text-muted group-hover:text-text-main group-hover:scale-105 transition-all">
              <User size={20} strokeWidth={1.75} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium text-text-main">
                Personal Information
              </span>
              <span className="text-xs font-light text-text-muted">
                Name, email, and linked accounts
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-text-muted group-hover:text-text-main transition-colors" />
        </div>

        {/* Preferences */}
        <Link
          to="/settings"
          className="flex items-center justify-between p-4 hover:bg-[#272B27] rounded-2xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-2xl bg-[#292D29] flex items-center justify-center text-text-muted group-hover:text-text-main group-hover:scale-105 transition-all">
              <Sliders size={20} strokeWidth={1.75} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium text-text-main">
                Preferences
              </span>
              <span className="text-xs font-light text-text-muted">
                Units, refresh rates & dark theme
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-text-muted group-hover:text-text-main transition-colors" />
        </Link>

        {/* Support */}
        <Link
          to="/support"
          className="flex items-center justify-between p-4 hover:bg-[#272B27] rounded-2xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-2xl bg-[#292D29] flex items-center justify-center text-text-muted group-hover:text-text-main group-hover:scale-105 transition-all">
              <HelpCircle size={20} strokeWidth={1.75} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium text-text-main">
                Help & Support
              </span>
              <span className="text-xs font-light text-text-muted">
                Troubleshooting, FAQs & documentation
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-text-muted group-hover:text-text-main transition-colors" />
        </Link>
      </div>

      {/* Sign Out Action */}
      <button
        type="button"
        className="w-full bg-[#1F211F] hover:bg-red-500/10 text-red-400 p-4 rounded-3xl font-medium text-base flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm active:scale-98"
      >
        <LogOut size={18} strokeWidth={1.75} />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
