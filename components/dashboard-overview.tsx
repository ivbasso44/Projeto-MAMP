"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
// import { Badge } from "@/components/ui/badge"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress" // Usaremos para barras de progresso simples
import { ScrollArea } from "../components/ui/scroll-area"
import { Separator } from "../components/ui/separator"
import { formatDate } from "../lib/utils"
import { useEffect, useState } from "react"
import { getDashboardSummary } from "../actions/dashboard"
import type { TaskHistory } from "../types/supabase"

interface DashboardSummaryProps {
  initialSummary: {
    totalTasks: number
    uniqueTaskNamesCount: number // Adicionado
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
}

export function DashboardOverview({ initialSummary }: DashboardSummaryProps) {
  const [summary, setSummary] = useState(initialSummary)
  const [isLoading, setIsLoading] = useState(false)

  // Opcional: Recarregar dados se necessário (ex: após uma ação de tarefa)
  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true)
      const newSummary = await getDashboardSummary()
      setSummary(newSummary)
      setIsLoading(false)
    }
    // Você pode adicionar um mecanismo para disparar isso, como um evento ou um intervalo
    // Por enquanto, ele carrega uma vez com os dados iniciais.
  }, [])

  const { totalTasks, tasksByStatus, tasksByWorkStation, recentHistory } = summary // Removido uniqueTaskNamesCount

  const getStatusPercentage = (status: "overdue" | "upcoming" | "on-time") => {
    if (totalTasks === 0) return 0
    return Math.round((tasksByStatus[status] / totalTasks) * 100)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Resumo de Status das Tarefas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resumo de Status</CardTitle>
          <GaugeIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks} Tarefas Totais</div>
          <p className="text-xs text-muted-foreground">Visão geral do estado atual das suas tarefas.</p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Atrasadas</span>
              <Badge variant="destructive">{tasksByStatus.overdue}</Badge>
            </div>
            <Progress value={getStatusPercentage("overdue")} className="h-2" variant="destructive" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Próximas (7 dias)</span>
              <Badge variant="secondary">{tasksByStatus.upcoming}</Badge>
            </div>
            <Progress value={getStatusPercentage("upcoming")} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Em Dia</span>
              <Badge variant="default">{tasksByStatus["on-time"]}</Badge>
            </div>
            <Progress value={getStatusPercentage("on-time")} className="h-2" variant="default" />
          </div>
        </CardContent>
      </Card>

      {/* Tarefas por Posto de Trabalho */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarefas por Posto de Trabalho</CardTitle>
          <FactoryIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {Object.keys(tasksByWorkStation).length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum posto de trabalho com tarefas.</p>
          ) : (
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {Object.entries(tasksByWorkStation).map(([station, count]) => (
                  <div key={station} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{station}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Execuções Recentes */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Histórico Recente</CardTitle>
          <HistoryIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {recentHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma execução recente registrada.</p>
          ) : (
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-3">
                {recentHistory.map((entry, index) => (
                  <div key={entry.id}>
                    <p className="text-sm font-medium">
                      Tarefa: <span className="text-primary">{entry.task_id?.substring(0, 8)}...</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Executado em: {entry.executed_at ? formatDate(entry.executed_at) : "N/A"} por {entry.executed_by || "N/A"}
                    </p>
                    {entry.observation && (
                      <p className="text-xs text-muted-foreground italic">Obs: {entry.observation}</p>
                    )}
                    {index < recentHistory.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Ícones Lucide React (adicionados para o dashboard)
function GaugeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 14L14.5 12.5L16 11" />
      <path d="M20 12A8 8 0 1 0 4 12A8 8 0 0 0 20 12Z" />
      <path d="M12 2v2" />
      <path d="M12 22v-2" />
      <path d="M22 12h-2" />
      <path d="M4 12H2" />
    </svg>
  )
}

function FactoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V8H2v12z" />
      <path d="M19 16H5" />
      <path d="M10 10v4" />
      <path d="M14 10v4" />
      <path d="M7 10v4" />
      <path d="M17 10v4" />
    </svg>
  )
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 18l-3 3" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}
