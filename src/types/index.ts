export type UserRole = 'admin' | 'superadmin' | 'employee'

export type AttendanceStatus = 'ontime' | 'late' | 'absent'

export type KasbonStatus = 'pending' | 'approved' | 'deducted'

export interface User {
  id: string
  name: string
  emp_id: string
  dept: string
  salary: number
  kasbon_limit: number
  role: UserRole
  status: 'aktif' | 'nonaktif'
}

export interface Attendance {
  id: string
  user_id: string
  date: string
  clock_in_time: string | null
  clock_out_time: string | null
  clock_in_photo_url: string | null
  clock_out_photo_url: string | null
  clock_in_lat: number | null
  clock_in_lng: number | null
  status: AttendanceStatus
  is_flagged: boolean
}

export interface Kasbon {
  id: string
  user_id: string
  amount: number
  reason: string
  category: string
  requested_at: string
  status: KasbonStatus
}

export interface Employee {
  id: string           // auth.users id
  email: string
  name: string
  emp_id: string
  dept: string
  jabatan: string
  role: 'admin' | 'employee'
  phone: string
  salary: number
  kasbon_limit: number
  shift: string
  address: string
  joined: string
  status: 'aktif' | 'nonaktif'
  absen?: number
  kasbon_used?: number
  last_slip?: string
}

export interface EmployeeFormData {
  name: string
  emp_id: string
  email: string
  password: string
  phone: string
  address: string
  dept: string
  jabatan: string
  role: 'admin' | 'employee'
  salary: string
  shift: string
  kasbon_limit: string
  status: 'aktif' | 'nonaktif'
  joined: string
}