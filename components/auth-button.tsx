"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "@/actions/auth"
import type { Session } from "@supabase/supabase-js"
import { LogIn, LogOut } from "lucide-react"
import Link from "next/link"

interface AuthButtonProps {
  session: Session | null
}

export function AuthButton({ session }: AuthButtonProps) {
  if (session) {
    return (
      <form action={signOut}>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </form>
    )
  }

  return (
    <Link href="/auth/sign-in">
      <Button variant="ghost" size="sm" className="flex items-center gap-2">
        <LogIn className="h-4 w-4" /> Entrar
      </Button>
    </Link>
  )
}
