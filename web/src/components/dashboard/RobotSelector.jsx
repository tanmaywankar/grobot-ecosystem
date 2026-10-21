import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Sprout } from "lucide-react";

export default function RobotSelector({
  devices = [],
  selectedDeviceId,
  onSelectDevice,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentDevice =
    devices.find((d) => d.id === selectedDeviceId) || devices[0];

  const isOnline = currentDevice?.status === "online";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger: OG Size with plain green circle and simple rounded hover corner */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Select Robot"
        className="flex items-center gap-2 md:gap-2.5 px-3 py-1.5 -mx-3 -my-1.5 rounded-2xl hover:bg-card/60 transition-colors cursor-pointer outline-none select-none group"
      >
        {/* Plain status circle (no glow/shadow) */}
        <span
          className={`size-2.5 md:size-3 rounded-full shrink-0 ${
            isOnline ? "bg-mint" : "bg-placeholder"
          }`}
        />

        {/* Robot Name (OG Size: 2xl / 3xl) */}
        <span className="text-2xl md:text-3xl font-medium text-text-main tracking-tight truncate max-w-[150px] sm:max-w-[220px] md:max-w-none">
          {currentDevice?.name || "Select Robot"}
        </span>

        {/* OG Chevron */}
        <ChevronDown
          className={`size-6 md:size-7 text-text-main transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-mint" : "group-hover:text-mint"
          }`}
          strokeWidth={1.75}
        />
      </button>

      {/* Floating Dropdown - Elevated with rounded corners, no outlines */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-68 sm:w-76 bg-[#242724] rounded-2xl md:rounded-3xl p-2 shadow-2xl shadow-black/70 z-50 flex flex-col gap-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-1.5 text-xs font-medium text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Your Robots</span>
            <span className="text-[11px] font-light text-text-muted/70">
              {devices.filter((d) => d.status === "online").length} online
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto flex flex-col gap-1 pr-0.5">
            {devices.map((device) => {
              const isSelected = device.id === currentDevice?.id;
              const deviceOnline = device.status === "online";
              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => {
                    onSelectDevice(device.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl sm:rounded-2xl text-left transition-colors cursor-pointer select-none ${
                    isSelected
                      ? "bg-[#2F332F] text-text-main shadow-xs"
                      : "hover:bg-[#2A2E2A] text-text-muted hover:text-text-main"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Plain status circle (no glow/shadow) */}
                    <span
                      className={`size-2 rounded-full shrink-0 ${
                        deviceOnline ? "bg-mint" : "bg-placeholder"
                      }`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm sm:text-base font-medium text-text-main truncate">
                        {device.name}
                      </span>
                      <span className="text-xs sm:text-sm font-light text-text-muted truncate flex items-center gap-1.5">
                        <Sprout size={12} className="shrink-0 opacity-70" />
                        <span className="truncate">{device.plantType || device.mood}</span>
                        {!deviceOnline && (
                          <span className="text-red-400 text-[11px] ml-1">
                            (offline)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={16} className="text-mint shrink-0 ml-2" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
