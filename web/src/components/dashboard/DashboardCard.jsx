export default function DashboardCard({ title, children, className = "" }) {
  return (
    <div
      className={`bg-[#1F211F] rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-md md:shadow-lg flex flex-col justify-between select-none ${className}`}
    >
      {title && (
        <h3 className="text-base md:text-lg font-medium text-text-main tracking-tight leading-tight mb-2">
          {title}
        </h3>
      )}
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </div>
  );
}
