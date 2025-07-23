"use client"

import { useState } from "react"
import { Calendar } from "../components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { formatDate } from "../lib/utils"
import type { AggregatedTaskDisplay } from "../types/supabase"

interface TaskCalendarProps {
  tasks: AggregatedTaskDisplay[]
}

export function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // Função para obter tarefas de uma data específica
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.next_due_at) return false
      const taskDate = new Date(task.next_due_at)
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Função para verificar se uma data tem tarefas
  const hasTasksForDate = (date: Date) => {
    return getTasksForDate(date).length > 0
  }

  // Tarefas para a data selecionada
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
      <div className="flex-1">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={month}
          onMonthChange={setMonth}
          className="rounded-md border"
          modifiers={{
            hasTasks: (date) => hasTasksForDate(date),
          }}
          modifiersStyles={{
            hasTasks: {
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              fontWeight: "bold",
            },
          }}
        />
      </div>

      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? `Tarefas para ${selectedDate.toLocaleDateString('pt-BR')}` : "Selecione uma data"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateTasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateTasks.map((task) => (
                    <div key={task.id} className="rounded-lg border p-3">
                      <p className="font-medium">{task.title || task.name}</p>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.work_stations?.map((station, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                          >
                            {station}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Frequência: {task.frequency_days} dias
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma tarefa agendada para esta data.</p>
              )
            ) : (
              <p className="text-muted-foreground">Selecione uma data para ver as tarefas agendadas.</p>
            )}
          </CardContent>
        </Card>

        {/* Resumo do mês */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Resumo do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Total de tarefas:</span> {tasks.length}
              </p>
              <p className="text-sm">
                <span className="font-medium">Tarefas este mês:</span>{" "}
                {
                  tasks.filter((task) => {
                    if (!task.next_due_at) return false
                    const taskDate = new Date(task.next_due_at)
                    return (
                      taskDate.getMonth() === month.getMonth() &&
                      taskDate.getFullYear() === month.getFullYear()
                    )
                  }).length
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
