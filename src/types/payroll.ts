export interface PayrollItem {
  user: {
    id: string;
    name: string;
    emp_id: string;
    dept: string | null;
    role: string;
    status: string;
    created_at?: string;
    salary: number;
    kasbon_limit: number;
    shift: string;
    address: string;
    jabatan?: string | null;
  };
  payrollId: string | null;
  basicSalary: number;
  incentives: number;
  kasbonDeduction: number;
  netSalary: number;
  status: 'draft' | 'paid' | 'not_generated';
  presentDays: number;
  created_at: string | null;
}
