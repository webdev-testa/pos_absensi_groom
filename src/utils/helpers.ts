export const AV_COLORS = [
  { bg: '#F5E8E4', fg: '#F5A940' }, { bg: '#E2F0E8', fg: '#3AAD7A' },
  { bg: '#F5EDE0', fg: '#B87333' }, { bg: '#EDE8F5', fg: '#6B4F9E' },
  { bg: '#E0EDF5', fg: '#4DC8F5' }, { bg: '#F5E8ED', fg: '#A0374F' },
  { bg: '#E8F5E0', fg: '#3A6B1A' }, { bg: '#F0EDE8', fg: '#6B5A3A' },
  { bg: '#E8EDF5', fg: '#3A4A8B' }, { bg: '#F5F0E8', fg: '#8B6A3A' },
  { bg: '#EBF5E8', fg: '#2A6B4B' }, { bg: '#F5E8F0', fg: '#8B3A6A' },
];

export function getInitials(name: string | undefined): string {
  if (!name) return "??";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function calcDur(inTime: string | null, outTime: string | null) {
  if (!inTime || !outTime) return null;
  const i = new Date(inTime);
  const o = new Date(outTime);
  const mins = Math.floor((o.getTime() - i.getTime()) / 60000);
  return `${Math.floor(mins / 60)}j ${mins % 60}m`;
}

export function durPct(inTime: string | null, outTime: string | null) {
  if (!inTime || !outTime) return 0;
  const i = new Date(inTime);
  const o = new Date(outTime);
  const mins = Math.floor((o.getTime() - i.getTime()) / 60000);
  return Math.min(100, Math.round((mins / 540) * 100)); // 9 hours = 540 mins
}

export function getCutiTypeLabel(type: string) {
  switch (type) {
    case "cuti": return "Cuti";
    case "izin": return "Izin";
    case "sakit": return "Sakit";
    default: return type;
  }
}

export function getCutiTypeColor(type: string) {
  switch (type) {
    case "cuti": return { bg: "#EDE8F5", fg: "#6B4F9E" };
    case "izin": return { bg: "#F5EDE0", fg: "#B87333" };
    case "sakit": return { bg: "#F5E8E4", fg: "#C84B2F" };
    default: return { bg: "#EDEAE4", fg: "#6B6760" };
  }
}

export function getHolidayTypeLabel(type: string) {
  switch (type) {
    case "holiday": return "Hari Libur";
    case "cuti_bersama": return "Cuti Bersama";
    case "closed": return "Tutup Kantor";
    default: return type;
  }
}

export function getHolidayTypeColor(type: string) {
  switch (type) {
    case "holiday": return { bg: "#F5E8E4", fg: "#C84B2F" };
    case "cuti_bersama": return { bg: "#EDE8F5", fg: "#6B4F9E" };
    case "closed": return { bg: "#EDEAE4", fg: "#6B6760" };
    default: return { bg: "#EDEAE4", fg: "#6B6760" };
  }
}

export function formatDateShort(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDayAndDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function formatDateRange(dates: { date: string }[]) {
  if (dates.length === 0) return "—";
  const sorted = [...dates].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 1) return formatDateShort(sorted[0].date);
  return `${formatDateShort(sorted[0].date)} — ${formatDateShort(sorted[sorted.length - 1].date)}`;
}
