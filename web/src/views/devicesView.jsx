import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import DeviceCard from "../components/deviceCard.jsx";
import { INITIAL_DEVICES, setActiveDeviceId } from "../data/devices.js";

export default function DevicesView() {
  const navigate = useNavigate();

  const handleDeviceClick = (device) => {
    setActiveDeviceId(device.id);
    navigate(`/dashboard?id=${device.id}`);
  };

  const handleAddDevice = () => {
    console.log("Add device clicked");
  };

  return (
    <div className="h-full md:h-auto w-full rounded-3xl md:rounded-2xl overflow-y-auto md:overflow-visible flex flex-col gap-6 select-none">
      <h1 className="text-3xl font-medium tracking-tight text-text-main ml-1">
        My Devices
      </h1>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 items-start justify-items-center">
        {INITIAL_DEVICES.map((device) => (
          <DeviceCard
            key={device.id}
            name={device.name}
            mood={device.mood}
            status={device.status}
            onClick={() => handleDeviceClick(device)}
          />
        ))}

        <button
          type="button"
          onClick={handleAddDevice}
          aria-label="Add new device"
          className="w-full max-w-[380px] aspect-[17/11] rounded-3xl border-2 border-dashed border-placeholder hover:border-text-main text-placeholder hover:text-text-main flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer hover:bg-card/30 group outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mint"
        >
          <div className="size-16 rounded-full border-2 border-dashed border-placeholder group-hover:border-text-main group-focus-visible:border-mint flex items-center justify-center transition-colors">
            <Plus size={32} />
          </div>
          <span className="text-sm font-medium text-text-muted group-hover:text-text-main transition-colors">
            Add Device
          </span>
        </button>
      </div>
    </div>
  );
}
