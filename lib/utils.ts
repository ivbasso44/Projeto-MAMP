import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Adiciona um número de dias a uma data e ajusta para o próximo dia útil se cair em fim de semana.
 * @param date A data inicial.
 * @param days O número de dias a adicionar (corridos).
 * @returns A nova data ajustada para o próximo dia útil se cair em sábado ou domingo.
 */
export function addDaysAndAdjustForWeekends(date: Date, days: number): Date {
  const newDate = new Date(date.getTime())
  newDate.setDate(newDate.getDate() + days) // Adiciona os dias corridos

  const dayOfWeek = newDate.getDay() // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  if (dayOfWeek === 0) {
    // Se for domingo, adiciona 1 dia para ir para segunda-feira
    newDate.setDate(newDate.getDate() + 1)
  } else if (dayOfWeek === 6) {
    // Se for sábado, adiciona 2 dias para ir para segunda-feira
    newDate.setDate(newDate.getDate() + 2)
  }
  return newDate
}

/**
 * Formata uma data para uma string legível.
 * @param dateString A string da data.
 * @returns A data formatada (ex: "DD/MM/YYYY").
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

/**
 * Calcula o status da tarefa (Atrasada, Próxima, Em dia).
 * @param nextDueDate A próxima data de vencimento da tarefa.
 * @returns O status da tarefa.
 */
export function getTaskStatus(nextDueDate: string | null): "overdue" | "upcoming" | "on-time" {
  if (!nextDueDate) return "on-time" // Ou outro status padrão se não houver data

  const today = new Date()
  today.setHours(0, 0, 0, 0) // Zera a hora para comparação apenas de data

  const dueDate = new Date(nextDueDate)
  dueDate.setHours(0, 0, 0, 0) // Zera a hora para comparação apenas de data

  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return "overdue" // Atrasada
  } else if (diffDays <= 7) {
    // Próxima em 7 dias ou menos
    return "upcoming"
  } else {
    return "on-time" // Em dia
  }
}

/**
 * Converte um ArrayBuffer para uma string Base64.
 * @param buffer O ArrayBuffer a ser convertido.
 * @returns A string Base64.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ""
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Converte uma string Base64 para um ArrayBuffer.
 * @param base64 A string Base64 a ser convertida.
 * @returns O ArrayBuffer resultante.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64)
  const len = binary_string.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}
