import { supabase } from '@/lib/supabase'

export function useKasbon(userId: string) {

  const getHistory = async () => {
    const { data } = await supabase
      .from('kasbon')
      .select('*')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false })
    return data
  }

  const getUsedThisMonth = async () => {
    const now = new Date()
    const from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`
    const { data } = await supabase
      .from('kasbon')
      .select('amount')
      .eq('user_id', userId)
      .gte('requested_at', from)
      .neq('status', 'rejected')
    // sum it up
    return data?.reduce((sum, k) => sum + k.amount, 0) ?? 0
  }

  const submit = async (amount: number, reason: string, category: string) => {
    const { data, error } = await supabase
      .from('kasbon')
      .insert({ user_id: userId, amount, reason, category })
    return { data, error }
  }

  return { getHistory, getUsedThisMonth, submit }
}