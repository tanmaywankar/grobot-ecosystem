import { LayoutDashboard, Bot, Settings, HelpCircle } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function LeftNavbar() {
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-4 p-2 rounded-xl cursor-pointer transition-colors ${
      isActive
        ? "bg-track text-text-main"
        : "text-text-muted hover:text-text-main"
    }`;

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col gap-3">
        <NavLink to="/devices" className={linkClasses}>
          <Bot className="shrink-0 -translate-y-0.5" size={30} />
          <span className="whitespace-nowrap hidden group-hover:inline text-lg font-medium leading-none">
            Devices
          </span>
        </NavLink>

        <NavLink to="/dashboard" className={linkClasses}>
          <LayoutDashboard className="shrink-0" size={30} />
          <span className="whitespace-nowrap hidden group-hover:inline text-lg font-medium">
            Dashboard
          </span>
        </NavLink>
      </div>

      <div className="flex flex-col gap-3">
        <hr className="border-0 border-t-2 rounded-2xl border-placeholder w-12 group-hover:w-full transition-all duration-200 mb-1" />
        <div className="flex flex-col gap-3">
          <NavLink to="/settings" className={linkClasses}>
            <Settings className="shrink-0" size={30} />
            <span className="whitespace-nowrap hidden group-hover:inline text-lg font-medium">
              Settings
            </span>
          </NavLink>

          <NavLink to="/support" className={linkClasses}>
            <HelpCircle className="shrink-0" size={30} />
            <span className="whitespace-nowrap hidden group-hover:inline text-lg font-medium">
              Support
            </span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}