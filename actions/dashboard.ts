"use server"

import { createServerClient } from "@/lib/supabase"
import type { TaskHistory } from "@/types/supabase" // Importe TaskInstance
import { getTaskStatus } from "@/lib/utils"

interface DashboardSummary {
  totalTasks: number // Total de instâncias
  uniqueTaskNamesCount: number // Total de definições únicas
  tasksByStatus: {
    overdue: number
    upcoming: number
    "on-time": number
  }
  tasksByWorkStation: {
    [station: string]: number
  }
  recentHistory: TaskHistory[]
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = createServerClient()

  // 1. Obter todas as instâncias de tarefas
  const { data: instances, error: instancesError } = await supabase.from("task_instances").select("*")
  if (instancesError) {
    console.error("Error fetching task instances for dashboard:", instancesError)
    return {
      totalTasks: 0,
      uniqueTaskNamesCount: 0,
      tasksByStatus: { overdue: 0, upcoming: 0, "on-time": 0 },
      tasksByWorkStation: {},
      recentHistory: [],
    }
  }

  // 2. Obter todas as definições de tarefas para contar nomes únicos
  const { data: definitions, error: definitionsError } = await supabase.from("task_definitions").select("id")
  if (definitionsError) {
    console.error("Error fetching task definitions for dashboard:", definitionsError)
    // Continua, mas a contagem de nomes únicos será 0
  }

  // 3. Obter histórico recente (últimas 5 execuções)
  const { data: history, error: historyError } = await supabase
    .from("task_history")
    .select("*")
    .order("executed_at", { ascending: false })
    .limit(5) // Limita para as 5 mais recentes

  if (historyError) {
    console.error("Error fetching recent history for dashboard:", historyError)
    // Continua com o restante dos dados, mas o histórico estará vazio
  }

  // Calcular tarefas por status (baseado em instâncias)
  const tasksByStatus = {
    overdue: 0,
    upcoming: 0,
    "on-time": 0,
  }

  instances.forEach((instance) => {
    const status = getTaskStatus(instance.next_due_at)
    tasksByStatus[status]++
  })

  // Calcular tarefas por posto de trabalho (baseado em instâncias)
  const tasksByWorkStation: { [station: string]: number } = {}
  instances.forEach((instance) => {
    instance.work_stations.forEach((station: string) => {
      const normalizedStation = station.trim().toLowerCase() // Normaliza para contagem
      tasksByWorkStation[normalizedStation] = (tasksByWorkStation[normalizedStation] || 0) + 1
    })
  })

  // Contagem de nomes de tarefas únicos
  const uniqueTaskNamesCount = definitions?.length || 0

  // Ordenar postos de trabalho por contagem (opcional, para melhor visualização)
  const sortedWorkStations: { [station: string]: number } = Object.fromEntries(
    Object.entries(tasksByWorkStation).sort(([, a], [, b]) => b - a),
  )

  return {
    totalTasks: instances.length,
    uniqueTaskNamesCount: uniqueTaskNamesCount,
    tasksByStatus: tasksByStatus,
    tasksByWorkStation: sortedWorkStations,
    recentHistory: history || [],
  }
}
