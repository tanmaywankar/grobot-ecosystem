import { Plus } from "lucide-react";
import DeviceCard from "../components/deviceCard.jsx";

const DEVICES = [
  { id: "grobot-01", name: "Grobotaro", mood: "Happy", status: "online" },
  { id: "grobot-02", name: "Grobottov", mood: "Needs Care", status: "offline" },
  { id: "grobot-03", name: "Grobotino", mood: "Thriving", status: "online" },
  { id: "grobot-04", name: "Grobotos", mood: "Thirsty", status: "online" },
  { id: "grobot-05", name: "Grobotnik", mood: "Overwatered", status: "offline" },
];

export default function DevicesView() {
  const handleAddDevice = () => {
    console.log("Add device clicked");
  };

  return (
    <div className="h-full md:h-auto w-full rounded-3xl md:rounded-2xl overflow-y-auto md:overflow-visible flex flex-col gap-6 select-none">
      <h1 className="text-3xl font-medium tracking-tight text-text-main ml-1">
        My Devices
      </h1>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 items-start justify-items-center">
        {DEVICES.map((device) => (
          <DeviceCard
            key={device.id}
            name={device.name}
            mood={device.mood}
            status={device.status}
            onClick={() => console.log(`Selected ${device.name}`)}
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