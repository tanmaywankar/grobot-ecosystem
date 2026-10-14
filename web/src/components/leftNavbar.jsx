import { LayoutDashboard, Bot, Settings, HelpCircle } from "lucide-react";
export default function LeftNavbar() {
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 p-2 rounded-xl bg-card-highlight cursor-pointer">
          <Bot className="shrink-0" size={30} />
          <span className="whitespace-nowrap hidden group-hover:inline text-lg font-medium">
            Devices
          </span>
        </div>

        <div className="flex items-center gap-4 p-2 rounded-xl text-text-muted hover:text-text-main cursor-pointer">
          <LayoutDashboard className="shrink-0" size={30} />
          <span className="whitespace-nowrap hidden group-hover:inline text-lg font-medium">
            Dashboard
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <hr className="border-0 border-t-2 rounded-2xl border-mist-600 w-12 group-hover:w-full transition-all duration-200 mb-1" />
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 p-2 rounded-xl text-text-muted hover:text-text-main cursor-pointer">
            <Settings className="shrink-0" size={30} />
            <span className="whitespace-nowrap hidden group-hover:inline text-lg font-medium">
              Settings
            </span>
          </div>

          <div className="flex items-center gap-4 p-2 rounded-xl text-text-muted hover:text-text-main cursor-pointer">
            <HelpCircle className="shrink-0" size={30} />
            <span className="whitespace-nowrap hidden group-hover:inline text-lg font-medium">
              Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
