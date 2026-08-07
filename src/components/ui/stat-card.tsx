import type { ReactNode } from "react"

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  valueColor?: string
  progressPercentage?: number
  progressBarColor?: string
  isActive?: boolean
  onClick?: () => void
  icon?: ReactNode
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  valueColor = "text-[#1A1814]",
  progressPercentage,
  progressBarColor = "bg-[#1A1814]",
  isActive = false,
  onClick,
  icon,
  className = "",
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-[16px] p-4.5 transition-all ${
        onClick ? "cursor-pointer" : ""
      } ${
        isActive
          ? "border-[#1A1814] ring-1 ring-[#1A1814]"
          : "border-[#E0DDD7] hover:border-[#CBC8C2] hover:-translate-y-[1px]"
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-xs text-[#6B6760] font-medium uppercase tracking-wider">{title}</div>
        {icon && <div className="text-[#6B6760]">{icon}</div>}
      </div>

      <div className={`font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none ${valueColor}`}>
        {value}
      </div>

      {subtitle && (
        <div className="text-xs text-[#A8A49E] mt-1.5">{subtitle}</div>
      )}

      {typeof progressPercentage === "number" && (
        <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden">
          <div
            className={`h-full rounded-[2px] transition-all duration-300 ${progressBarColor}`}
            style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
          />
        </div>
      )}
    </div>
  )
}
