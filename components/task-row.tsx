"use client"

import { useState } from "react"
import { TableCell, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { markTaskAsDone, deleteTask } from "../actions/tasks"
import { formatDate, getTaskStatus } from "../lib/utils"
import { HistoryModal } from "./history-modal"
import { AddObservationModal } from "./add-observation-modal"
import type { TaskWithDefinition, AggregatedTaskDisplay } from "../types/supabase" // Importe os novos tipos
import { EditTaskDialog } from "./edit-task-dialog"
import { DeleteTaskAlert } from "./delete-task-alert"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { WorkStationsModal } from "./work-stations-modal"
import { toast } from "sonner"

interface TaskRowProps {
  task: AggregatedTaskDisplay // Altera o tipo aqui
  onTaskUpdate: (updatedInstance: TaskWithDefinition) => void // Agora recebe TaskWithDefinition
  onTaskDelete: (deletedInstanceId: string) => void // Agora recebe o ID da instância
}

export function TaskRow({ task, onTaskUpdate, onTaskDelete }: TaskRowProps) {
  const [isMarking, setIsMarking] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showObservationModal, setShowObservationModal] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showWorkStationsModal, setShowWorkStationsModal] = useState(false)

  const status = getTaskStatus(task.next_due_at || null)

  const handleMarkAsDone = async (observation: string | null) => {
    setIsMarking(true)
    setShowObservationModal(false)
    // markTaskAsDone agora opera no ID da instância representativa
    const result = await markTaskAsDone(task.id, observation)
    if (result.success && result.updatedInstance) {
      // Precisamos adicionar o nome da definição à instância atualizada para o onTaskUpdate
      onTaskUpdate({ ...result.updatedInstance, name: task.name, project_id: undefined })
      toast.success("Sucesso!", {
        description: result.toastMessage,
      })
    } else {
      console.error(result.message)
      toast.error("Erro", {
        description: result.toastMessage || "Não foi possível marcar a tarefa como concluída.",
      })
    }
    setIsMarking(false)
  }

  const handleDeleteTask = async () => {
    setShowDeleteAlert(false) // Fecha o alerta antes de iniciar a exclusão
    // deleteTask agora opera no ID da instância representativa
    const result = await deleteTask(task.id)
    if (result.success) {
      onTaskDelete(task.id)
      toast.success("Sucesso!", {
        description: result.toastMessage,
      })
    } else {
      console.error(result.message)
      toast.error("Erro", {
        description: result.toastMessage || "Não foi possível excluir a tarefa.",
      })
    }
  }

  const getStatusBadgeVariant = (status: "overdue" | "upcoming" | "on-time") => {
    switch (status) {
      case "overdue":
        return "destructive"
      case "upcoming":
        return "warning"
      case "on-time":
      default:
        return "default"
    }
  }

  const getStatusBadgeText = (status: "overdue" | "upcoming" | "on-time") => {
    switch (status) {
      case "overdue":
        return "Atrasada"
      case "upcoming":
        return "Próxima"
      case "on-time":
      default:
        return "Em Dia"
    }
  }

  const MAX_VISIBLE_WORK_STATIONS = 2
  const visibleWorkStations = task.work_stations.slice(0, MAX_VISIBLE_WORK_STATIONS)
  const remainingWorkStationsCount = task.work_stations.length - MAX_VISIBLE_WORK_STATIONS

  return (
    <TableRow>
      <TableCell className="font-medium">{task.name}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {visibleWorkStations.map((station, index) => (
            <Badge key={index} variant="secondary">
              {station}
            </Badge>
          ))}
          {remainingWorkStationsCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="h-auto py-1 px-2"
              onClick={() => setShowWorkStationsModal(true)}
            >
              +{remainingWorkStationsCount}
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center">{task.frequency_days}</TableCell>
      <TableCell className="text-center">{formatDate(task.last_executed_at || null)}</TableCell>
      <TableCell className="text-center">{formatDate(task.next_due_at || null)}</TableCell>
      <TableCell className="text-center">
        <Badge variant={getStatusBadgeVariant(status) as "default" | "destructive" | "secondary" | "outline"}>{getStatusBadgeText(status)}</Badge>
      </TableCell>
      <TableCell className="text-right flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => setShowObservationModal(true)} disabled={isMarking}>
          {isMarking ? "Processando..." : "Concluída"}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setShowHistoryModal(true)}>
          Histórico
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowEditDialog(true)}
          aria-label="Editar Tarefa"
          // Desabilita edição direta de tarefas agrupadas para evitar complexidade
          // O ideal seria um modal de edição que mostre todas as instâncias
          disabled={task.originalInstances.length > 1}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDeleteAlert(true)}
          aria-label="Excluir Tarefa"
          className="text-red-500 hover:text-red-600"
          // Desabilita exclusão direta de tarefas agrupadas para evitar complexidade
          disabled={task.originalInstances.length > 1}
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </TableCell>

      <AddObservationModal
        isOpen={showObservationModal}
        onClose={() => setShowObservationModal(false)}
        onConfirm={handleMarkAsDone}
        isLoading={isMarking}
      />

      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        taskId={task.id} // Passa o ID da instância representativa
        taskName={task.name}
      />

      {/* O EditTaskDialog agora recebe uma TaskInstance e o nome da definição */}
      <EditTaskDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        taskInstance={task.originalInstances.find((t) => t.id === task.id) || null} // Encontra a instância original correspondente
        taskName={task.name} // Passa o nome da definição
        onTaskUpdated={onTaskUpdate}
      />

      <DeleteTaskAlert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        taskId={task.id} // Passa o ID da instância representativa
        taskName={task.name}
        onTaskDeleted={handleDeleteTask} // Alterado para usar a função local
      />

      <WorkStationsModal
        isOpen={showWorkStationsModal}
        onClose={() => setShowWorkStationsModal(false)}
        taskName={task.name}
        workStations={task.work_stations}
      />
    </TableRow>
  )
}
