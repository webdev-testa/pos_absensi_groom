export type UserRole = 'admin' | 'superadmin' | 'employee'
export type AttendanceStatus = 'ontime' | 'late' | 'absent'
export type KasbonStatus = 'pending' | 'approved' | 'deducted' | 'rejected'
export type UserStatus = 'active' | 'inactive'

export interface User {
  id: string
  name: string
  emp_id: string
  email: string | null
  phone: string | null
  address: string | null
  dept: string | null
  jabatan: string | null
  role: UserRole
  salary: number | null
  shift: string | null
  kasbon_limit: number | null
  status: UserStatus
  joined: string | null
  created_at: string | null
  face_embedding?: number[] | null
  face_photo_url?: string | null
}

export interface Attendance {
  id: string
  user_id: string | null
  date: string
  clock_in_time: string | null
  clock_out_time: string | null
  clock_in_photo_url: string | null
  clock_out_photo_url: string | null
  clock_in_lat: number | null
  clock_in_lng: number | null
  clock_out_lat: number | null
  clock_out_lng: number | null
  is_flagged: boolean | null
  status: AttendanceStatus
  created_at: string | null
}

export interface Kasbon {
  id: string
  user_id: string | null
  date: string
  amount: number
  reason: string | null
  status: KasbonStatus
  created_at: string | null
  approved_by?: string | null
  approved_at?: string | null
  category?: string | null
  deducted_at?: string | null
}

export interface Employee extends Omit<User, 'status' | 'role' | 'salary' | 'dept' | 'kasbon_limit'> {
  email: string
  jabatan: string
  role: 'admin' | 'employee'
  phone: string
  shift: string
  address: string
  joined: string
  status: UserStatus
  salary: number
  dept: string
  kasbon_limit: number
  absen?: number
  kasbon_used?: number
  last_slip?: string
}

export interface EmployeeFormData {
  name: string
  emp_id: string
  email: string
  password?: string
  phone: string
  address: string
  dept: string
  jabatan: string
  role: 'admin' | 'employee'
  salary: string | number
  shift: string
  kasbon_limit: string | number
  status: UserStatus
  joined: string
}