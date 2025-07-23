"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Session } from "@supabase/supabase-js"

interface UserProfileProps {
  session: Session | null
}

export function UserProfile({ session }: UserProfileProps) {
  if (!session) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
          <CardDescription>Nenhuma sessão de usuário ativa.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Por favor, faça login para ver seu perfil.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Perfil do Usuário</CardTitle>
        <CardDescription>Informações da sua conta.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={session.user.email || ""} readOnly disabled />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="userId">ID do Usuário</Label>
          <Input id="userId" type="text" value={session.user.id} readOnly disabled />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="createdAt">Membro Desde</Label>
          <Input
            id="createdAt"
            type="text"
            value={new Date(session.user.created_at).toLocaleDateString()}
            readOnly
            disabled
          />
        </div>
        {/* Você pode adicionar mais campos aqui, como metadata do usuário, se houver */}
      </CardContent>
    </Card>
  )
}
