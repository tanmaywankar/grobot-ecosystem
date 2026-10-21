import { Bell } from "lucide-react";

export default function NotificationsView() {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 select-none pb-12 pt-2 md:pt-4">
      <h1 className="text-2xl md:text-3xl font-medium text-text-main tracking-tight">
        Notifications
      </h1>

      <div className="bg-[#1F211F] rounded-3xl p-8 md:p-12 shadow-md flex flex-col items-center justify-center text-center">
        <div className="size-16 rounded-full bg-[#292D29] flex items-center justify-center text-mint mb-4">
          <Bell size={28} strokeWidth={1.75} />
        </div>
        <h2 className="text-lg font-medium text-text-main">
          All caught up!
        </h2>
        <p className="text-sm font-light text-text-muted mt-1 max-w-xs">
          No new alerts or telemetry warnings from your plant robots.
        </p>
      </div>
    </div>
  );
}
