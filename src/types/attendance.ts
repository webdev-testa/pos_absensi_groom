export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  clock_in_time: string;
  clock_out_time: string | null;
  status: string;
  is_flagged: boolean;
  clock_in_photo_url: string | null;
  clock_in_lat?: number | null;
  clock_in_lng?: number | null;
  clock_out_lat?: number | null;
  clock_out_lng?: number | null;
  users: {
    name: string;
    emp_id: string;
    dept: string;
  } | null;
}

export interface CutiRecord {
  id: string;
  user_id: string;
  date: string;
  status: string;
  is_flagged: boolean | null;
  clock_in_photo_url?: string | null;
  users: { name: string; emp_id: string; dept: string } | null;
}

export interface CutiGroup {
  userId: string;
  userName: string;
  empId: string;
  dept: string;
  type: string; // "cuti" | "izin" | "sakit"
  status: string; // full status e.g. "cuti_pending"
  dates: { id: string; date: string; clock_in_photo_url?: string | null }[];
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: string;
  created_at: string;
}
