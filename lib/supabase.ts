import { createClient } from "@supabase/supabase-js"

export const createServerClient = () => {
  // Use as variáveis de ambiente SEM o prefixo NEXT_PUBLIC_ para o lado do servidor
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY // Ou process.env.SUPABASE_SERVICE_ROLE_KEY se precisar de privilégios de admin

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables for server-side client.")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// createBrowserClient permanece inalterado, pois já usa as variáveis corretas para o cliente
let supabaseClient: ReturnType<typeof createClient> | undefined

export const createBrowserClient = () => {
  if (!supabaseClient) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Missing Supabase environment variables for browser-side client.")
    }
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )
  }
  return supabaseClient
}

