"use client"

import { useEffect } from "react"

interface AuthToastHandlerProps {
  message?: string // Mensagem passada via searchParams
}

export function AuthToastHandler({ message }: AuthToastHandlerProps) {
  // O useSearchParams aqui é redundante se a mensagem já vem como prop,
  // mas é útil se você quiser ler outros parâmetros ou garantir que o componente
  // reaja a mudanças na URL. Para este caso, a prop é suficiente.

  useEffect(() => {
    if (message) {
      // Usando console.log por enquanto até configurar o toast corretamente
      console.log("Mensagem:", message)
    }
  }, [message])

  return null // Este componente não renderiza nada visível
}
