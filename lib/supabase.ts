import { createClient } from "@supabase/supabase-js"
import type { Database } from "../types/supabase"
// Remove o import de cookies, pois não será mais usado para autenticação de sessão
// Simplifica createServerClient para não usar o adaptador de cookies para autenticação
// Ele ainda será usado para interagir com o banco de dados.

// Nova versão de createServerClient sem o adaptador de cookies para autenticação
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  // Retorne o cliente Supabase sem o adaptador de cookies para autenticação
  // Ele ainda pode ser usado para operações de banco de dados.
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Crie um cliente Supabase para uso no cliente (componentes React)
// Usamos o padrão singleton para evitar múltiplas instâncias no cliente
let supabaseClient: ReturnType<typeof createClient<Database>> | undefined

export const createBrowserClient = () => {
  if (!supabaseClient) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Missing Supabase environment variables")
    }
    supabaseClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )
  }
  return supabaseClient
}
