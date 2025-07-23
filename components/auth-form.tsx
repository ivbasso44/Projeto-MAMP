"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useActionState } from "react"
import { useToast } from "@/hooks/use-toast" // Importe useToast
import { useRouter } from "next/navigation" // Importe useRouter

interface AuthFormProps {
  type: "sign-in" | "sign-up"
  action: (formData: FormData) => Promise<{ success: boolean; message: string; redirectTo?: string }>
}

export function AuthForm({ type, action }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, null)
  const { toast } = useToast()
  const router = useRouter()

  const title = type === "sign-in" ? "Entrar" : "Criar Conta"
  const description = type === "sign-in" ? "Acesse sua conta para continuar." : "Crie uma nova conta para começar."
  const buttonText = type === "sign-in" ? "Entrar" : "Registrar"
  const linkText = type === "sign-in" ? "Não tem uma conta? Crie uma aqui." : "Já tem uma conta? Faça login aqui."
  const linkHref = type === "sign-in" ? "/auth/sign-up" : "/auth/sign-in"

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
          variant: "default",
        })
      } else {
        toast({
          title: "Erro",
          description: state.message,
          variant: "destructive",
        })
      }
    }
  }, [state, toast])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isPending} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required disabled={isPending} />
          </div>
          {/* Removido o display de mensagem inline, agora será via toast */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Carregando..." : buttonText}
          </Button>
        </form>
        <div className="text-center text-sm text-muted-foreground">
          <Link href={linkHref} className="underline">
            {linkText}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
