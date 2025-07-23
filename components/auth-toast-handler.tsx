"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface AuthToastHandlerProps {
  message?: string // Mensagem passada via searchParams
}

export function AuthToastHandler({ message }: AuthToastHandlerProps) {
  const { toast } = useToast()
  // O useSearchParams aqui é redundante se a mensagem já vem como prop,
  // mas é útil se você quiser ler outros parâmetros ou garantir que o componente
  // reaja a mudanças na URL. Para este caso, a prop é suficiente.

  useEffect(() => {
    if (message) {
      toast({
        title: "Sucesso!",
        description: message,
        variant: "default",
      })
    }
  }, [message, toast])

  return null // Este componente não renderiza nada visível
}
