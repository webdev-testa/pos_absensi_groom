import { Badge } from "@/components/ui/badge"

interface AttendanceStatusBadgeProps {
  status: string
  className?: string
}

export function AttendanceStatusBadge({ status, className }: AttendanceStatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ontime":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"
      case "late":
        return "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60"
      case "absent":
        return "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60"
      case "out":
        return "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60"
      default:
        return "bg-surface-soft text-muted-foreground border-border"
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
      case "out":
        return "● Sudah pulang"
      default:
        return status
    }
  }

  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold tracking-tight transition-colors shadow-none ${getStatusStyle(status)} ${className || ""}`}
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
        return "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60"
      case 'approved':
        return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"
      case 'deducted':
        return "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60"
      case 'rejected':
        return "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60"
      default:
        return "bg-surface-soft text-muted-foreground border-border"
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
      className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold tracking-tight transition-colors shadow-none ${getStyle(status)} ${className || ""}`}
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
        return "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60"
      case 'approved':
        return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"
      case 'rejected':
        return "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60"
      default:
        return "bg-surface-soft text-muted-foreground border-border"
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
      className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold tracking-tight transition-colors shadow-none ${getStyle(status)} ${className || ""}`}
    >
      {getLabel(status)}
    </Badge>
  )
}
