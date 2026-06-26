import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { PayrollItem } from '@/types/payroll';
import * as XLSX from 'xlsx';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function usePayroll() {
  const queryClient = useQueryClient();

  // 1. Period Selector & Basic Filters
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [searchQ, setSearchQ] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'paid' | 'not_generated'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Modals & Inputs
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [incentiveAmount, setIncentiveAmount] = useState('');
  const [incentiveUserId, setIncentiveUserId] = useState<string | null>(null);

  // Generate Date Range for the Selected Month
  const periodDates = useMemo(() => {
    const startOfPeriod = `${selectedPeriod}-01`;
    const [year, month] = selectedPeriod.split('-').map(Number);
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const endOfPeriod = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
    return { startOfPeriod, endOfPeriod };
  }, [selectedPeriod]);

  // Get Period Label in Indonesian (e.g. "Juni 2026")
  const selectedPeriodLabel = useMemo(() => {
    const [year, month] = selectedPeriod.split('-').map(Number);
    const d = new Date(year, month - 1, 1);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, [selectedPeriod]);

  // Generate last 12 months for select filter
  const monthsList = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      list.push({ val, label });
    }
    return list;
  }, []);

  /* ─── FETCH QUERIES ─── */
  
  // 1. Fetch all employees
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['payroll_employees'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('users')
        .select('*')
        .eq('role', 'employee')
        .order('name');
      
      if (error) {
        toast.error('Gagal memuat data karyawan');
        throw error;
      }
      return data || [];
    }
  });

  // 2. Fetch generated payrolls for the period
  const { data: payrolls = [], isLoading: loadingPayrolls } = useQuery({
    queryKey: ['payrolls', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('payroll')
        .select('*')
        .eq('period', selectedPeriod);
      
      if (error) {
        toast.error('Gagal memuat data payroll');
        throw error;
      }
      return data || [];
    }
  });

  // 3. Fetch approved/deducted kasbons for the period
  const { data: kasbons = [], isLoading: loadingKasbons } = useQuery({
    queryKey: ['kasbons', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .select('*')
        .or(`and(status.eq.approved,requested_at.lt.${periodDates.endOfPeriod}),and(status.eq.deducted,requested_at.gte.${periodDates.startOfPeriod},requested_at.lt.${periodDates.endOfPeriod})`);
      
      if (error) {
        toast.error('Gagal memuat data kasbon');
        throw error;
      }
      return data || [];
    }
  });

  // 4. Fetch attendance records count (present count: status 'ontime' or 'late')
  const { data: attendanceCounts = {}, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance_counts', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('attendance')
        .select('user_id, status')
        .gte('date', periodDates.startOfPeriod)
        .lt('date', periodDates.endOfPeriod)
        .in('status', ['ontime', 'late', 'cuti', 'izin', 'sakit']);
      
      if (error) {
        toast.error('Gagal memuat data absensi');
        throw error;
      }
      
      const counts: Record<string, number> = {};
      (data || []).forEach(row => {
        if (row.user_id) {
          counts[row.user_id] = (counts[row.user_id] || 0) + 1;
        }
      });
      return counts;
    }
  });

  /* ─── DATA COMPILATION & CALCULATIONS ─── */
  
  const payrollData = useMemo(() => {
    return employees.map(emp => {
      // 1. Find existing payroll record
      const payrollRecord = payrolls.find(p => p.user_id === emp.id);
      
      // 2. Sum up approved/deducted kasbons this period
      const empKasbons = kasbons.filter(k => k.user_id === emp.id);
      const totalKasbon = empKasbons.reduce((sum, k) => sum + Number(k.amount), 0);
      
      // 3. Get basic salary (historical basic_salary from generated payroll if exists, otherwise employee profile salary)
      const basicSalary = payrollRecord ? (payrollRecord.basic_salary || 0) : (emp.salary || 0);
      
      // 4. Get incentives
      const incentives = payrollRecord ? (payrollRecord.incentives || 0) : 0;
      
      // 5. Get kasbon deduction (use database value if generated, otherwise sum approved)
      const kasbonDeduction = payrollRecord ? (payrollRecord.kasbon_deduction || 0) : totalKasbon;
      
      // 6. Gaji Bersih calculation
      const netSalary = basicSalary + incentives - kasbonDeduction;
      
      // 7. Get attendance count
      const presentDays = attendanceCounts[emp.id] || 0;
      
      return {
        user: emp,
        payrollId: payrollRecord?.id || null,
        basicSalary,
        incentives,
        kasbonDeduction,
        netSalary,
        status: payrollRecord ? (payrollRecord.status || 'draft') : 'not_generated',
        presentDays,
        created_at: payrollRecord?.created_at || null
      } as PayrollItem;
    });
  }, [employees, payrolls, kasbons, attendanceCounts]);

  // Filter inactive employees unless they already have a payroll record this month
  const mappedPayrollData = useMemo(() => {
    return payrollData.filter(item => {
      return item.user.status === 'active' || item.status !== 'not_generated';
    });
  }, [payrollData]);

  // Filter and Search
  const filteredData = useMemo(() => {
    return mappedPayrollData.filter(item => {
      const q = searchQ.toLowerCase();
      const matchSearch = item.user.name.toLowerCase().includes(q) || item.user.emp_id.toLowerCase().includes(q);
      const matchDept = deptFilter === 'all' || item.user.dept === deptFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [mappedPayrollData, searchQ, deptFilter, statusFilter]);

  // Dynamic lists
  const departments = useMemo(() => {
    return [...new Set(employees.map(emp => emp.dept).filter(Boolean))] as string[];
  }, [employees]);

  // Selected employee detail item
  const selectedItem = useMemo(() => {
    return selectedUserId ? (mappedPayrollData.find(item => item.user.id === selectedUserId) || null) : null;
  }, [selectedUserId, mappedPayrollData]);

  // Summary Metrics (calculated from all generated payrolls in the month)
  const stats = useMemo(() => {
    const generated = mappedPayrollData.filter(item => item.status !== 'not_generated');
    const totalGajiBersih = generated.reduce((sum, item) => sum + item.netSalary, 0);
    const countPaid = generated.filter(item => item.status === 'paid').length;
    const countTotal = generated.length;
    const totalInsentif = generated.reduce((sum, item) => sum + item.incentives, 0);
    const totalKasbonDipotong = generated.reduce((sum, item) => sum + item.kasbonDeduction, 0);
    
    return {
      totalGajiBersih,
      countPaid,
      countTotal,
      totalInsentif,
      totalKasbonDipotong
    };
  }, [mappedPayrollData]);

  /* ─── MUTATIONS ─── */

  // 1. Generate/Save all payrolls as Draft
  const generateMutation = useMutation({
    mutationFn: async () => {
      const activeEmployees = mappedPayrollData.filter(item => item.user.status === 'active');
      if (activeEmployees.length === 0) return;
      
      const payload = activeEmployees.map(item => ({
        id: item.payrollId || generateUUID(),
        user_id: item.user.id,
        period: selectedPeriod,
        basic_salary: item.basicSalary,
        incentives: item.incentives,
        kasbon_deduction: item.kasbonDeduction,
        net_salary: item.basicSalary + item.incentives - item.kasbonDeduction,
        status: item.status === 'not_generated' ? 'draft' : item.status
      }));
      
      const { error } = await supabaseAdmin
        .schema('hr')
        .from('payroll')
        .upsert(payload, { onConflict: 'user_id,period' });
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Payroll berhasil disimpan sebagai Draft');
      queryClient.invalidateQueries({ queryKey: ['payrolls', selectedPeriod] });
    },
    onError: (error: any) => {
      toast.error('Gagal memproses payroll: ' + error.message);
    }
  });

  // 2. Mark an individual employee's payroll as Paid & mark their kasbon as Deducted
  const markPaidMutation = useMutation({
    mutationFn: async (item: PayrollItem) => {
      const record = {
        id: item.payrollId || generateUUID(),
        user_id: item.user.id,
        period: selectedPeriod,
        basic_salary: item.basicSalary,
        incentives: item.incentives,
        kasbon_deduction: item.kasbonDeduction,
        net_salary: item.basicSalary + item.incentives - item.kasbonDeduction,
        status: 'paid'
      };
      
      const { error: payrollError } = await supabaseAdmin
        .schema('hr')
        .from('payroll')
        .upsert(record, { onConflict: 'user_id,period' });
        
      if (payrollError) throw payrollError;
      
      const { error: kasbonError } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .update({ status: 'deducted' })
        .eq('user_id', item.user.id)
        .eq('status', 'approved')
        .lt('requested_at', periodDates.endOfPeriod);
        
      if (kasbonError) throw kasbonError;
    },
    onSuccess: (_, item) => {
      toast.success(`Pembayaran gaji ${item.user.name} berhasil diproses`);
      queryClient.invalidateQueries({ queryKey: ['payrolls', selectedPeriod] });
      queryClient.invalidateQueries({ queryKey: ['kasbons', selectedPeriod] });
    },
    onError: (error: any) => {
      toast.error('Gagal memproses pembayaran: ' + error.message);
    }
  });

  // 3. Mark all Draft payrolls as Paid & mark their kasbons as Deducted in bulk
  const markAllPaidMutation = useMutation({
    mutationFn: async () => {
      const draftItems = mappedPayrollData.filter(item => item.status === 'draft');
      if (draftItems.length === 0) return;
      
      const payrollPayload = draftItems.map(item => ({
        id: item.payrollId || generateUUID(),
        user_id: item.user.id,
        period: selectedPeriod,
        basic_salary: item.basicSalary,
        incentives: item.incentives,
        kasbon_deduction: item.kasbonDeduction,
        net_salary: item.basicSalary + item.incentives - item.kasbonDeduction,
        status: 'paid'
      }));
      
      const { error: payrollError } = await supabaseAdmin
        .schema('hr')
        .from('payroll')
        .upsert(payrollPayload, { onConflict: 'user_id,period' });
        
      if (payrollError) throw payrollError;
      
      const userIds = draftItems.map(item => item.user.id);
      const { error: kasbonError } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .update({ status: 'deducted' })
        .in('user_id', userIds)
        .eq('status', 'approved')
        .lt('requested_at', periodDates.endOfPeriod);
        
      if (kasbonError) throw kasbonError;
    },
    onSuccess: () => {
      toast.success('Semua draft payroll berhasil ditandai Terbayar');
      queryClient.invalidateQueries({ queryKey: ['payrolls', selectedPeriod] });
      queryClient.invalidateQueries({ queryKey: ['kasbons', selectedPeriod] });
    },
    onError: (error: any) => {
      toast.error('Gagal memproses pembayaran massal: ' + error.message);
    }
  });

  // 4. Update individual incentive (bonus)
  const updateIncentiveMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const item = mappedPayrollData.find(d => d.user.id === userId);
      if (!item) throw new Error('Karyawan tidak ditemukan');
      
      const record = {
        id: item.payrollId || generateUUID(),
        user_id: userId,
        period: selectedPeriod,
        basic_salary: item.basicSalary,
        incentives: amount,
        kasbon_deduction: item.kasbonDeduction,
        net_salary: item.basicSalary + amount - item.kasbonDeduction,
        status: item.status === 'not_generated' ? 'draft' : item.status
      };
      
      const { error } = await supabaseAdmin
        .schema('hr')
        .from('payroll')
        .upsert(record, { onConflict: 'user_id,period' });
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Nominal insentif berhasil disimpan');
      setShowIncentiveModal(false);
      queryClient.invalidateQueries({ queryKey: ['payrolls', selectedPeriod] });
    },
    onError: (error: any) => {
      toast.error('Gagal menyimpan insentif: ' + error.message);
    }
  });

  /* ─── UTILITY FUNCTIONS ─── */

  // 1. Export payroll list to Excel (.xlsx format)
  const exportExcel = () => {
    const dataToExport = filteredData;
    if (dataToExport.length === 0) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }
    
    const headers = ['Nama Karyawan', 'ID Karyawan', 'Divisi', 'Gaji Pokok', 'Insentif', 'Potongan Kasbon', 'Gaji Bersih', 'Status'];
    const rows = dataToExport.map(item => [
      item.user.name,
      item.user.emp_id,
      item.user.dept || '',
      item.basicSalary,
      item.incentives,
      item.kasbonDeduction,
      item.netSalary,
      item.status === 'not_generated' ? 'Belum Dibuat' : item.status === 'draft' ? 'Draft' : 'Terbayar'
    ]);
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll');
    
    XLSX.writeFile(workbook, `Payroll_Karyawan_${selectedPeriod}.xlsx`);
    toast.success('Daftar payroll berhasil diexport');
  };

  // 2. Local Print Slip Gaji Functionality
  const [printItem, setPrintItem] = useState<PayrollItem | null>(null);
  
  const handlePrint = (item: PayrollItem) => {
    setPrintItem(item);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintItem(null), 1000);
    }, 100);
  };

  // 3. Open Incentive Form Modal
  const openIncentiveModal = (item: PayrollItem) => {
    setIncentiveUserId(item.user.id);
    setIncentiveAmount(item.incentives > 0 ? String(item.incentives).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
    setShowIncentiveModal(true);
  };

  const handleSaveIncentive = () => {
    if (!incentiveUserId) return;
    const amt = parseInt(incentiveAmount.replace(/\./g, ''), 10) || 0;
    updateIncentiveMutation.mutate({ userId: incentiveUserId, amount: amt });
  };

  const isInitialLoading = loadingEmployees || loadingPayrolls || loadingKasbons || loadingAttendance;

  return {
    selectedPeriod,
    setSelectedPeriod,
    searchQ,
    setSearchQ,
    deptFilter,
    setDeptFilter,
    statusFilter,
    setStatusFilter,
    selectedUserId,
    setSelectedUserId,
    showIncentiveModal,
    setShowIncentiveModal,
    incentiveAmount,
    setIncentiveAmount,
    monthsList,
    selectedPeriodLabel,
    isInitialLoading,

    // Compiled data & subsets
    mappedPayrollData,
    filteredData,
    departments,
    selectedItem,
    stats,

    // print slip metadata
    printItem,

    // Operations
    exportExcel,
    handlePrint,
    openIncentiveModal,
    handleSaveIncentive,
    generateMutation,
    markPaidMutation,
    markAllPaidMutation,
    updateIncentiveMutation
  };
}
