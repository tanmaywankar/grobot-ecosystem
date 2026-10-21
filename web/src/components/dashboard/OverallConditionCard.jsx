import { HeartPlus } from "lucide-react";
import DashboardCard from "./DashboardCard.jsx";

export default function OverallConditionCard({
  title = "Overall Condition",
  status = "Excellent",
  score = 80,
  className = "",
}) {
  const radius = 24;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius; // ~150.8
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference * (1 - clampedScore / 100);

  return (
    <DashboardCard title={title} className={`h-[140px] ${className}`}>
      <div className="flex items-center gap-5 py-1">
        {/* Circular Health Ring with HeartPlus Icon */}
        <div className="relative size-16 shrink-0 flex items-center justify-center">
          <svg className="size-full -rotate-90 overflow-visible" viewBox="0 0 60 60">
            {/* Background Circle */}
            <circle
              cx="30"
              cy="30"
              r={radius}
              fill="none"
              stroke="#292D29"
              strokeWidth={strokeWidth}
            />
            {/* Foreground Score Ring */}
            <circle
              cx="30"
              cy="30"
              r={radius}
              fill="none"
              stroke="#99FFD5"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Centered HeartPlus Icon */}
          <div className="absolute inset-0 flex items-center justify-center text-text-main">
            <HeartPlus size={22} strokeWidth={2} />
          </div>
        </div>

        {/* Verdict & Subtitle */}
        <div className="flex flex-col">
          <h4 className="text-2xl md:text-3xl font-medium text-text-main tracking-tight leading-none">
            {status}
          </h4>
          <span className="text-base md:text-lg font-light text-text-muted mt-2 leading-none">
            {score}% Health Score
          </span>
        </div>
      </div>
    </DashboardCard>
  );
}
