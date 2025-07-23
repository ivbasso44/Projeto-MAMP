"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { getTaskStatus } from "@/lib/utils"
import type { TaskInstance } from "@/types/supabase"

interface GanttMilestoneProps {
  type: "last_executed" | "next_due"
  taskName: string
  instance: TaskInstance // Pass the full instance for detailed tooltip
}

export function GanttMilestone({ type, taskName, instance }: GanttMilestoneProps) {
  let colorClass = ""
  let tooltipTitle = ""
  let displayDate: Date | null = null

  if (type === "last_executed") {
    colorClass = "bg-blue-500" // Neutral color for past execution
    tooltipTitle = "Última Execução"
    displayDate = instance.last_executed_at ? new Date(instance.last_executed_at) : null
  } else {
    // type === "next_due"
    const status = getTaskStatus(instance.next_due_at)
    switch (status) {
      case "overdue":
        colorClass = "bg-destructive"
        break
      case "upcoming":
        colorClass = "bg-warning"
        break
      case "on-time":
      default:
        colorClass = "bg-primary"
        break
    }
    tooltipTitle = "Próxima Execução"
    displayDate = instance.next_due_at ? new Date(instance.next_due_at) : null
  }

  if (!displayDate) return null // Don't render if date is missing

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn("h-3 w-3 rounded-full border-2 border-background cursor-pointer flex-shrink-0", colorClass)}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{taskName}</p>
          <p>
            {tooltipTitle}: {format(displayDate, "dd/MM/yyyy", { locale: ptBR })}
          </p>
          <p>Frequência: {instance.frequency_days} dias</p>
          <p>Postos: {instance.work_stations.join(", ")}</p>
          {type === "next_due" && (
            <p>
              Status:{" "}
              {getTaskStatus(instance.next_due_at) === "overdue"
                ? "Atrasada"
                : getTaskStatus(instance.next_due_at) === "upcoming"
                  ? "Próxima"
                  : "Em Dia"}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
