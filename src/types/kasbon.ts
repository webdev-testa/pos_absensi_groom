export type KasbonStatus = 'pending' | 'approved' | 'deducted' | 'rejected'

export interface KasbonMapped {
  id: string
  name: string
  empId: string
  date: string
  amount: number
  note: string
  status: KasbonStatus
  balance: number
  user_id: string
  requested_at: string
  category: string
}

export interface ActiveEmployeeOption {
  id: string
  name: string
  emp_id: string
  kasbon_limit?: number | null
}
