"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"

// Definindo um tipo de retorno mais explícito para as ações de autenticação
type AuthActionResult = {
  success: boolean
  message: string
}

export async function signIn(previousState: any, formData: FormData): Promise<AuthActionResult> {
  if (!formData) {
    console.error("signIn: formData é nulo ou indefinido!")
    return { success: false, message: "Erro interno: dados do formulário ausentes." }
  }

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("Tentativa de login para:", email)

  const supabase = createServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Erro ao fazer login:", error.message, error.status)
    let userMessage = error.message
    if (error.message.includes("Invalid login credentials")) {
      userMessage = "E-mail ou senha incorretos."
    } else if (error.message.includes("Email not confirmed")) {
      userMessage = "Por favor, confirme seu e-mail antes de fazer login."
    }
    // Retorna o erro para o componente cliente
    return { success: false, message: userMessage }
  }

  // A sessão já deve estar disponível nos cookies após signInWithPassword
  // Não é estritamente necessário chamar getSession aqui novamente,
  // mas mantemos para fins de log e depuração.
  const {
    data: { session },
  } = await supabase.auth.getSession()
  console.log(
    "Sessão após login (signIn action):",
    session ? "Sessão encontrada" : "Nenhuma sessão encontrada",
    session?.user?.email,
  )

  console.log("Login bem-sucedido para:", email)
  revalidatePath("/", "layout") // Revalida o cache da página principal
  redirect("/") // Redireciona diretamente no servidor
}

export async function signUp(previousState: any, formData: FormData): Promise<AuthActionResult> {
  if (!formData) {
    console.error("signUp: formData é nulo ou indefinido!")
    return { success: false, message: "Erro interno: dados do formulário ausentes." }
  }

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("Tentativa de registro para:", email)
  console.log("NEXT_PUBLIC_SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL)

  const supabase = createServerClient()

  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`
  console.log("URL de redirecionamento:", redirectUrl)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
    },
  })

  if (error) {
    console.error("Erro ao registrar:", error.message, error.status)
    let userMessage = error.message
    if (error.message.includes("User already registered")) {
      userMessage = "Este e-mail já está registrado. Tente fazer login."
    } else if (error.message.includes("Password should be at least")) {
      userMessage = "A senha deve ter pelo menos 6 caracteres."
    }
    // Retorna o erro para o componente cliente
    return { success: false, message: userMessage }
  }

  console.log("Registro iniciado para:", email, "- Dados:", data)

  revalidatePath("/", "layout")

  if (data.user && !data.user.email_confirmed_at) {
    redirect("/auth/sign-in?message=Verifique seu e-mail para confirmar o registro.")
  } else {
    redirect("/")
  }
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/auth/sign-in") // Este redirect pode permanecer, pois não está ligado a useActionState
}

export async function getUserSession() {
  const supabase = createServerClient()
  console.log("getUserSession: Tentando obter sessão...")
  const {
    data: { session },
    error, // Captura o erro aqui também
  } = await supabase.auth.getSession()

  if (error) {
    console.error("getUserSession: Erro ao obter sessão do Supabase:", error.message)
    return null
  }

  if (session) {
    console.log("getUserSession: Sessão encontrada para o usuário:", session.user?.email, "ID:", session.user?.id)
    return session
  } else {
    console.log("getUserSession: Nenhuma sessão ativa encontrada.")
    return null
  }
}
