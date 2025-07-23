import { createServerClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redireciona para a página principal após confirmação bem-sucedida
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error("Erro na confirmação de e-mail:", error)
      // Redireciona para login com mensagem de erro
      return NextResponse.redirect(`${origin}/auth/sign-in?error=Erro na confirmação do e-mail`)
    }
  }

  // Se não há código, redireciona para login
  return NextResponse.redirect(`${origin}/auth/sign-in`)
}
