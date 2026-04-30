import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

const USER_ID = 'rajvir'

export async function loadData() {
  try {
    const { data, error } = await supabase
      .from('fitness_data')
      .select('data, theme')
      .eq('user_id', USER_ID)
      .single()
    if (error || !data) return null
    return { data: data.data, theme: data.theme }
  } catch(e) {
    console.error('Load error:', e)
    return null
  }
}

export async function saveData(data, theme) {
  try {
    const { error } = await supabase
      .from('fitness_data')
      .upsert({
        user_id: USER_ID,
        data: data,
        theme: theme,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
    if (error) {
      console.error('Save error:', error)
      return false
    }
    return true
  } catch(e) {
    console.error('Save exception:', e)
    return false
  }
}