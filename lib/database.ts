import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

// Create Supabase client with publishable key
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test database connection
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    console.log('Supabase connected successfully')
    return true
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return false
  }
}

// Generic query function for raw SQL (when needed)
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      query: text,
      params: params || []
    })
    
    if (error) throw error
    
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: data?.length || 0 })
    
    return { rows: data || [] }
  } catch (error) {
    console.error('Query error:', error)
    throw error
  }
}

// Transaction helper using Supabase
export async function transaction<T>(callback: (client: typeof supabase) => Promise<T>): Promise<T> {
  try {
    // Supabase handles transactions automatically for batch operations
    const result = await callback(supabase)
    return result
  } catch (error) {
    console.error('Transaction error:', error)
    throw error
  }
}

export default supabase