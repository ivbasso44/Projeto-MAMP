"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { deleteTask } from "@/actions/tasks"

interface DeleteTaskAlertProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskName: string
  onTaskDeleted: (deletedTaskId: string) => void
}

export function DeleteTaskAlert({ isOpen, onClose, taskId, taskName, onTaskDeleted }: DeleteTaskAlertProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deleteTask(taskId)
    if (result.success) {
      onTaskDeleted(taskId)
      onClose()
    } else {
      console.error(result.message)
      // TODO: Mostrar um toast de erro
    }
    setIsLoading(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a tarefa{" "}
            <span className="font-semibold">{taskName}</span> e todo o seu histórico.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-red-500 hover:bg-red-600">
            {isLoading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
