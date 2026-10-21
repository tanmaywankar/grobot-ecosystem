import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import DashboardCard from "./DashboardCard.jsx";

export default function AreaChartCard({
  title = "Temperature Chart",
  data = [],
  unit = "°C",
  className = "",
}) {
  const defaultData = [
    { time: "Sept", temp: 28 },
    { time: "", temp: 36 },
    { time: "", temp: 38 },
    { time: "", temp: 36 },
    { time: "Oct", temp: 32 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <DashboardCard title={title} className={`h-[280px] ${className}`}>
      <div className="w-full h-56 pt-2 select-none outline-none focus:outline-none focus-within:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_svg]:outline-none [&_*:focus]:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            accessibilityLayer={false}
          >
            <defs>
              <linearGradient id="mintAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#99FFD5" stopOpacity={0.45} />
                <stop offset="85%" stopColor="#99FFD5" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#99FFD5" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              stroke="#879B93"
              fontSize={13}
              fontWeight={300}
              tickLine={false}
              axisLine={{ stroke: "#3C423C" }}
              dy={6}
            />

            <YAxis
              stroke="#879B93"
              fontSize={13}
              fontWeight={300}
              tickLine={false}
              axisLine={{ stroke: "#3C423C" }}
              domain={[0, 70]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70]}
              dx={-4}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#242724",
                border: "none",
                borderRadius: "16px",
                color: "#DEFFF2",
                fontSize: "14px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
              }}
              formatter={(val) => [`${val} ${unit}`, "Temperature"]}
              labelFormatter={(label) => (label ? `Date: ${label}` : "")}
            />

            <Area
              type="monotone"
              dataKey="temp"
              stroke="#99FFD5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#mintAreaGradient)"
              dot={{
                fill: "#FFFFFF",
                stroke: "#99FFD5",
                strokeWidth: 2,
                r: 3.5,
              }}
              activeDot={{
                r: 5,
                fill: "#99FFD5",
                stroke: "#181A19",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
