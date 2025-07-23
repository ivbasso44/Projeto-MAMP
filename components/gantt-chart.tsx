"use client"
import { useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import type { AggregatedTaskDisplay } from "../types/supabase"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "../lib/utils"
import { GanttMilestone } from "./gantt-milestone"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"

interface GanttChartProps {
  tasks: AggregatedTaskDisplay[]
}

// Constants for chart layout
const PIXELS_PER_DAY = 30 // Width of each day in pixels
const ROW_HEIGHT = 40 // Height of each task row
const HEADER_HEIGHT = 60 // Height of the timeline header
const TASK_NAME_COLUMN_WIDTH = 200 // Width of the sticky task name column

export function GanttChart({ tasks }: GanttChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  // Calculate the date range to display
  const { startDate, endDate, totalDays, datesInView } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Define a data de início como o primeiro dia do mês atual
    const start = new Date(today.getFullYear(), today.getMonth(), 1)

    // Define a data de fim como o último dia do mês, 3 meses a partir de agora
    const end = new Date(today.getFullYear(), today.getMonth() + 3, 0) // 0 para o último dia do mês anterior

    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 para incluir o dia final

    const dates = []
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      dates.push(d)
    }

    return { startDate: start, endDate: end, totalDays: diffDays, datesInView: dates }
  }, [])

  // Scroll to current date on load
  useEffect(() => {
    if (chartRef.current) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const diffDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const scrollPosition = diffDays * PIXELS_PER_DAY - chartRef.current.clientWidth / 2 // Centraliza no dia atual
      chartRef.current.scrollLeft = Math.max(0, scrollPosition)
    }
  }, [startDate])

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Gráfico de Gantt de Tarefas (Milestones)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto rounded-md border" ref={chartRef}>
          {/* Container for both sticky task names and scrollable timeline */}
          <div style={{ width: TASK_NAME_COLUMN_WIDTH + totalDays * PIXELS_PER_DAY }}>
            {/* Timeline Header */}
            <div
              className="grid bg-background border-b"
              style={{
                gridTemplateColumns: `${TASK_NAME_COLUMN_WIDTH}px repeat(${totalDays}, ${PIXELS_PER_DAY}px)`,
                height: HEADER_HEIGHT,
              }}
            >
              <div className="sticky left-0 z-20 flex items-center border-r p-2 font-semibold bg-background">
                Tarefa
              </div>
              {datesInView.map((date, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col items-center justify-center border-r text-xs",
                    date.getDay() === 0 || date.getDay() === 6 ? "bg-gray-100 dark:bg-gray-800" : "", // Fim de semana
                    date.toDateString() === new Date().toDateString() ? "bg-blue-100 dark:bg-blue-900" : "", // Hoje
                  )}
                >
                  <span className="font-semibold">{format(date, "dd", { locale: ptBR })}</span>
                  <span className="text-[0.65rem] text-muted-foreground">{format(date, "MMM", { locale: ptBR })}</span>
                </div>
              ))}
            </div>

            {/* Task Rows */}
            {tasks.map((task) => (
              <div
                key={task.id} // Usa o ID da tarefa representativa
                className="grid items-center border-b"
                style={{
                  gridTemplateColumns: `${TASK_NAME_COLUMN_WIDTH}px repeat(${totalDays}, ${PIXELS_PER_DAY}px)`,
                  height: ROW_HEIGHT,
                }}
              >
                <div className="sticky left-0 z-10 flex h-full items-center border-r p-2 text-sm font-medium bg-background">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="truncate max-w-[180px] text-left">{task.name}</TooltipTrigger>
                      <TooltipContent>
                        <p>{task.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {/* Daily cells for milestones */}
                {datesInView.map((dateInView, dateIndex) => {
                  const milestonesForDay = task.originalInstances.flatMap((instance) => {
                    const currentDay = dateInView.toDateString()
                    const lastExecutedDay = instance.last_executed_at
                      ? new Date(instance.last_executed_at).toDateString()
                      : null
                    const nextDueDay = instance.next_due_at ? new Date(instance.next_due_at).toDateString() : null

                    const m: Array<{ type: "last_executed" | "next_due"; instance: any }> = []
                    if (lastExecutedDay === currentDay) {
                      m.push({ type: "last_executed" as const, instance: instance })
                    }
                    if (nextDueDay === currentDay) {
                      m.push({ type: "next_due" as const, instance: instance })
                    }
                    return m
                  })

                  return (
                    <div
                      key={dateIndex}
                      className={cn(
                        "relative h-full border-r flex items-center justify-center",
                        dateInView.getDay() === 0 || dateInView.getDay() === 6 ? "bg-gray-50 dark:bg-gray-800/50" : "", // Weekend background
                        dateInView.toDateString() === new Date().toDateString() ? "bg-blue-50 dark:bg-blue-900/50" : "", // Today background
                      )}
                    >
                      {milestonesForDay.length > 0 && (
                        <div className="flex flex-col gap-0.5">
                          {" "}
                          {/* Container for multiple milestones on one day */}
                          {milestonesForDay.map((milestone, mIndex) => (
                            <GanttMilestone
                              key={`${milestone.instance.id}-${milestone.type}-${mIndex}`}
                              type={milestone.type}
                              taskName={task.name}
                              instance={milestone.instance}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
