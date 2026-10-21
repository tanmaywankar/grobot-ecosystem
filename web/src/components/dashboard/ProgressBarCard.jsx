import DashboardCard from "./DashboardCard.jsx";

export default function ProgressBarCard({
  title,
  value = 50, // 0 to 100
  labels = ["Low", "Optimal", "High"],
  className = "",
}) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <DashboardCard title={title} className={`h-[125px] ${className}`}>
      <div className="flex flex-col justify-center py-1">
        {/* Progress Pill Bar */}
        <div className="w-full h-4.5 bg-track rounded-full p-0.5 overflow-hidden">
          <div
            style={{ width: `${clampedValue}%` }}
            className="h-full bg-mint rounded-full transition-all duration-700 ease-out min-w-[12px]"
          />
        </div>

        {/* 3-Point Metric Scale */}
        <div className="flex justify-between items-center text-sm md:text-base font-light text-text-muted mt-2.5 px-0.5">
          <span className="text-left">{labels[0]}</span>
          <span className="text-center">{labels[1]}</span>
          <span className="text-right">{labels[2]}</span>
        </div>
      </div>
    </DashboardCard>
  );
}
