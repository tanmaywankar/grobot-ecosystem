import { Bot, LayoutDashboard, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  {
    name: "Devices",
    to: "/devices",
    icon: Bot,
  },
  {
    name: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Settings",
    to: "/settings",
    icon: Settings,
  },
];

export default function BottomNavbar() {
  return (
    <nav
      aria-label="Bottom navigation"
      className="w-full bg-card/95 backdrop-blur-md border-t border-placeholder/25 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] px-3 flex items-center justify-around select-none shadow-2xl shrink-0"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 outline-none group ${
                isActive ? "text-text-main" : "text-text-muted hover:text-text-main"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-15 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-track text-mint scale-105"
                      : "bg-transparent text-text-muted group-hover:text-text-main"
                  }`}
                >
                  <Icon size={23} strokeWidth={isActive ? 2.5 : 2.2} />
                </div>
                <span
                  className={`text-xs font-medium tracking-tight mt-1 transition-colors leading-none ${
                    isActive
                      ? "font-semibold text-text-main"
                      : "text-text-muted group-hover:text-text-main"
                  }`}
                >
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
