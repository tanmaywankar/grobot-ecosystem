import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  INITIAL_DEVICES,
  getActiveDeviceId,
  setActiveDeviceId,
} from "../data/devices.js";
import RadialGaugeCard from "../components/dashboard/RadialGaugeCard.jsx";
import ProgressBarCard from "../components/dashboard/ProgressBarCard.jsx";
import AreaChartCard from "../components/dashboard/AreaChartCard.jsx";
import OverallConditionCard from "../components/dashboard/OverallConditionCard.jsx";
import OfflineDeviceView from "../components/dashboard/OfflineDeviceView.jsx";

export default function DashboardView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewingCachedDeviceId, setViewingCachedDeviceId] = useState(null);

  // 1. Resolve selected device from URL or localStorage fallback
  const urlId = searchParams.get("id");
  const selectedId =
    urlId && INITIAL_DEVICES.some((d) => d.id === urlId)
      ? urlId
      : getActiveDeviceId();

  const currentDevice =
    INITIAL_DEVICES.find((d) => d.id === selectedId) || INITIAL_DEVICES[0];

  const telemetry = currentDevice.telemetry;
  const isOffline = currentDevice.status === "offline";
  const showCachedForOffline = viewingCachedDeviceId === currentDevice.id;

  // 2. Keep URL in sync if user landed on /dashboard without ?id=
  useEffect(() => {
    if (!urlId) {
      setSearchParams({ id: selectedId }, { replace: true });
    } else {
      setActiveDeviceId(urlId);
    }
  }, [urlId, selectedId, setSearchParams]);

  // Switch to first online device
  const handleSwitchToOnline = () => {
    const firstOnline = INITIAL_DEVICES.find((d) => d.status === "online") || INITIAL_DEVICES[0];
    setActiveDeviceId(firstOnline.id);
    setSearchParams({ id: firstOnline.id });
  };

  return (
    <div className="h-full w-full overflow-y-auto md:overflow-visible flex flex-col items-center select-none pt-2 md:pt-4 pb-8">
      {/* If device is offline and user hasn't explicitly requested cached data, show the Material Design Offline view */}
      {isOffline && !showCachedForOffline ? (
        <OfflineDeviceView
          device={currentDevice}
          onSwitchToOnline={handleSwitchToOnline}
          onViewCachedData={() => setViewingCachedDeviceId(currentDevice.id)}
        />
      ) : (
        <div className="w-full flex flex-col items-center">
          {/* Subtle notice when viewing cached data for an offline device */}
          {isOffline && showCachedForOffline && (
            <div className="w-full max-w-[600px] mb-4 p-3 px-5 rounded-2xl bg-[#292D29] text-text-muted flex items-center justify-between text-sm shadow-md">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-400" />
                Viewing last recorded telemetry (Offline)
              </span>
              <button
                type="button"
                onClick={() => setViewingCachedDeviceId(null)}
                className="text-mint hover:underline cursor-pointer font-medium"
              >
                Back to Offline status
              </button>
            </div>
          )}

          {/* Main Cards Grid: 2 columns constrained to max-w-[600px] so cards are closer to square rather than wide rectangles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-[600px] mx-auto items-start">
            {/* Left Column (Total height: 210 + 125 + 210 + 2*gap = 585px) */}
            <div className="flex flex-col gap-5 w-full">
              <RadialGaugeCard
                title="Current Temperature"
                value={telemetry.temperature}
                unit="°C"
                status={telemetry.temperatureStatus}
                min={0}
                max={50}
              />

              <ProgressBarCard
                title="Sunlight intensity"
                value={telemetry.sunlight}
                labels={["Low", "Optimal", "High"]}
              />

              <RadialGaugeCard
                title="Current Humidity"
                value={telemetry.humidity}
                unit="%"
                status={telemetry.humidityStatus}
                min={0}
                max={100}
              />
            </div>

            {/* Right Column (Total height: 125 + 280 + 140 + 2*gap = 585px) */}
            <div className="flex flex-col gap-5 w-full">
              <ProgressBarCard
                title="Soil Moisture"
                value={telemetry.soilMoisture}
                labels={["Dry", "Perfect", "Wet"]}
              />

              <AreaChartCard
                title="Temperature Chart"
                data={telemetry.chartData}
                unit="°C"
              />

              <OverallConditionCard
                title="Overall Condition"
                status={telemetry.condition}
                score={telemetry.healthScore}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
