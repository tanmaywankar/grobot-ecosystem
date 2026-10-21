import grobotSvg from "../assets/grobotCard.svg";

export default function DeviceCard({
  name = "Grobotaro",
  mood = "Happy",
  status = "offline",
  onClick,
}) {
  const isOnline = status === "online";

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${name}, status: ${status}, mood: ${mood}`}
      className={`relative w-full max-w-95 aspect-17/11 rounded-3xl px-6 pt-4 pb-0 flex flex-col justify-between overflow-hidden shadow-xl cursor-pointer transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mint ${
        !isOnline ? "grayscale border border-slate-800" : "border border-mist-800"
      }`}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: isOnline
            ? "radial-gradient(ellipse 120% 90% at 50% 90%, rgba(66, 238, 96, 0.28) 0%, rgba(31, 33, 31, 0.85) 65%)"
            : "radial-gradient(ellipse 60% 50% at 50% 68%, rgba(50, 60, 52, 0.2) 0%, rgba(31, 33, 31, 0.9) 70%, transparent 100%)",
        }}
      />
      
      {/* Top Header */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-medium tracking-tight text-text-main">
            {name}
          </h2>
          <span className="text-sm font-medium text-text-muted mt-0.5">
            {mood}
          </span>
        </div>

        <span
          className={`px-3 py-1 my-1 rounded-full text-xs font-light tracking-wide transition-colors ${
            isOnline
              ? "bg-[#2C694E] text-text-main"
              : "bg-track text-text-muted"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>

      {/* Stage: Removed `pt-2`, added `leading-none` and `block` on the SVG to prevent baseline alignment shift */}
      <div className="relative z-10 w-full flex items-end justify-center">
        <img
          src={grobotSvg}
          alt={name}
          className="w-full h-auto max-h-34 object-contain pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] block -mb-px"
        />
      </div>
    </div>
  );
}