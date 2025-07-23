"use client"

import React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { importTasksFromXlsx } from "@/actions/tasks"
import { useActionState } from "react"

interface ImportTasksDialogProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess: () => void
}

export function ImportTasksDialog({ isOpen, onClose, onImportSuccess }: ImportTasksDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  // useActionState para lidar com o estado da Server Action
  const [state, formAction, isPending] = useActionState(importTasksFromXlsx, null)

  // Ref para controlar se o toast já foi exibido para o estado atual
  const hasShownToastRef = React.useRef(false)

  // Efeito para reagir ao resultado da Server Action
  React.useEffect(() => {
    // console.log("ImportTasksDialog useEffect triggered. State:", state); // Para depuração
    // Só mostra o toast se houver uma mensagem e ainda não tivermos mostrado para este estado
    if (state?.message && !hasShownToastRef.current) {
      // toast({
      //   title: state.success ? "Importação Concluída" : "Erro na Importação",
      //   description: state.message,
      //   variant: state.success ? "default" : "destructive",
      // })
      hasShownToastRef.current = true // Marca que o toast foi exibido para este estado

      if (state.success) {
        onImportSuccess()
        onClose()
        setFile(null) // Limpa o arquivo selecionado
      }
    } else if (!state?.message && hasShownToastRef.current) {
      // Reseta o ref quando não há mensagem (ex: diálogo fechado, formulário resetado)
      hasShownToastRef.current = false
    }
  }, [state, toast, onClose, onImportSuccess])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
      hasShownToastRef.current = false // Resetar o ref ao selecionar um novo arquivo
    } else {
      setFile(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Importar Tarefas (XLSX)</DialogTitle>
          <DialogDescription>
            Selecione um arquivo .xlsx para importar novas tarefas.
            <br />
            <span className="text-xs text-muted-foreground">
              O arquivo deve conter colunas para "Nome da Tarefa", "Postos de Trabalho" (separados por vírgula) e
              "Frequência (dias)".
            </span>
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Arquivo XLSX</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !file}>
              {isPending ? "Importando..." : "Importar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
