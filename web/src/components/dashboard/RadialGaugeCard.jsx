import DashboardCard from "./DashboardCard.jsx";

export default function RadialGaugeCard({
  title,
  value,
  unit = "",
  status = "Normal",
  min = 0,
  max = 100,
  className = "",
}) {
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const radius = 75;
  const circumference = Math.PI * radius; // ~235.62
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <DashboardCard title={title} className={`h-[210px] ${className}`}>
      <div className="relative flex flex-col items-center justify-center pt-1 pb-0">
        <svg
          viewBox="0 0 200 115"
          className="w-full max-w-[215px] overflow-visible"
        >
          {/* Background Track */}
          <path
            d="M 25 95 A 75 75 0 0 1 175 95"
            fill="none"
            stroke="#292D29"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Foreground Value Arc */}
          <path
            d="M 25 95 A 75 75 0 0 1 175 95"
            fill="none"
            stroke="#99FFD5"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Centered Metric & Subtitle */}
        <div className="absolute inset-x-0 bottom-2.5 flex flex-col items-center justify-center text-center">
          <span className="text-3xl md:text-4xl font-medium text-text-main tracking-tight leading-none">
            {value} {unit}
          </span>
          <span className="text-base md:text-lg font-light text-text-muted mt-1.5 leading-none">
            {status}
          </span>
        </div>
      </div>
    </DashboardCard>
  );
}
