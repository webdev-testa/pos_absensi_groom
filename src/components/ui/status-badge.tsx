import { Badge } from "@/components/ui/badge"

interface AttendanceStatusBadgeProps {
  status: string
  className?: string
}

export function AttendanceStatusBadge({ status, className }: AttendanceStatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ontime":
        return "bg-[#E6F7F0] text-[#065F46] border-[#A7F3D0]"
      case "late":
        return "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
      case "absent":
        return "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]"
      default:
        return "bg-[#F3EFE9] text-[#5C6B73] border-[#E2DDD5]"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ontime":
        return "✓ Tepat waktu"
      case "late":
        return "⚠ Terlambat"
      case "absent":
        return "✕ Tidak hadir"
      default:
        return status
    }
  }

  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold tracking-tight transition-colors ${getStatusStyle(status)} ${className || ""}`}
    >
      {getStatusLabel(status)}
    </Badge>
  )
}

interface KasbonStatusBadgeProps {
  status: string
  className?: string
}

export function KasbonStatusBadge({ status, className }: KasbonStatusBadgeProps) {
  const getStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
      case 'approved':
        return "bg-[#E6F7F0] text-[#065F46] border-[#A7F3D0]"
      case 'deducted':
        return "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]"
      case 'rejected':
        return "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]"
      default:
        return "bg-[#F3EFE9] text-[#5C6B73] border-[#E2DDD5]"
    }
  }

  const getLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return "⏳ Menunggu"
      case 'approved':
        return "✓ Disetujui"
      case 'deducted':
        return "Dipotong"
      case 'rejected':
        return "✗ Ditolak"
      default:
        return status
    }
  }

  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold tracking-tight transition-colors ${getStyle(status)} ${className || ""}`}
    >
      {getLabel(status)}
    </Badge>
  )
}

interface LeaveStatusBadgeProps {
  status: string
  className?: string
}

export function LeaveStatusBadge({ status, className }: LeaveStatusBadgeProps) {
  const getStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
      case 'approved':
        return "bg-[#E6F7F0] text-[#065F46] border-[#A7F3D0]"
      case 'rejected':
        return "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]"
      default:
        return "bg-[#F3EFE9] text-[#5C6B73] border-[#E2DDD5]"
    }
  }

  const getLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return "⏳ Menunggu Persetujuan"
      case 'approved':
        return "✓ Disetujui"
      case 'rejected':
        return "✗ Ditolak"
      default:
        return status
    }
  }

  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold tracking-tight transition-colors ${getStyle(status)} ${className || ""}`}
    >
      {getLabel(status)}
    </Badge>
  )
}
