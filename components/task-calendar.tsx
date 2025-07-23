"use client"

import { useState, useEffect } from "react"
import { Calendar } from "../components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { formatDate } from "../lib/utils"
import type { TaskInstance } from "../types/supabase" // Alterado para TaskInstance
import { createServerClient } from "../lib/supabase" // Importar para buscar nomes

interface TaskCalendarProps {
  tasks: TaskInstance[] // Agora recebe TaskInstance[]
}

export function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [taskNamesMap, setTaskNamesMap] = useState<Map<string, string>>(new Map()) // Para armazenar nomes de tarefas

  // Efeito para buscar os nomes das tarefas quando as tasks mudam
  // Isso é um hack para o cliente, idealmente o nome viria junto com a TaskInstance
  // ou seria passado de forma mais eficiente.
  // Para este caso, como o calendário só precisa do nome para exibição, faremos uma busca leve.
  useEffect(() => {
    // Changed from useEffect to useState for immediate execution on mount
    const fetchNames = async () => {
      const supabase = createServerClient() // Cliente do lado do servidor, mas usado aqui para buscar dados
      const definitionIds = Array.from(new Set(tasks.map((t) => t.task_definition_id)))
      if (definitionIds.length === 0) return

      const { data, error } = await supabase.from("task_definitions").select("id, name").in("id", definitionIds)

      if (error) {
        console.error("Error fetching task definitions for calendar:", error)
        return
      }

      const newMap = new Map<string, string>()
      data.forEach((def) => newMap.set(def.id, def.name))
      setTaskNamesMap(newMap)
    }
    fetchNames()
  }, [tasks])

  // Mapeia as datas de vencimento para o calendário
  const modifiers = {
    taskDue: tasks
      .filter((task) => task.next_due_at)
      .map((task) => {
        const date = new Date(task.next_due_at!)
        date.setHours(0, 0, 0, 0) // Zera a hora para comparação
        return date
      }),
  }

  // Reintroduzindo modifiersStyles para o destaque visual do dia
  const modifiersStyles = {
    taskDue: {
      // Usando cores do tema shadcn/ui para consistência
      backgroundColor: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
      borderRadius: "0.25rem", // rounded-md
    },
  }

  // Mantendo classNames para o ponto adicional, se desejar
  const classNames = {
    day_taskDue: "rdp-day_task-due", // Nome da classe CSS para dias com tarefas (para o ponto)
  }

  const tasksForSelectedDate = selectedDate
    ? tasks.filter((task) => {
        if (!task.next_due_at) return false
        const taskDate = new Date(task.next_due_at)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate.getTime() === selectedDate.getTime()
      })
    : []

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Próximas Execuções no Calendário</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
            fixedWeeks={true} // Adicionado para manter o tamanho fixo
          />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-2">
            Tarefas para {selectedDate ? formatDate(selectedDate.toISOString()) : "a data selecionada"}
          </h3>
          {tasksForSelectedDate.length > 0 ? (
            <ul className="space-y-2">
              {tasksForSelectedDate.map((task) => (
                <li key={task.id} className="border-b pb-2 last:border-b-0 last:pb-0">
                  <p className="font-medium">{taskNamesMap.get(task.task_definition_id) || "Nome Desconhecido"}</p>
                  <p className="text-sm text-muted-foreground">Postos: {task.work_stations.join(", ")}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Nenhuma tarefa agendada para esta data.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
