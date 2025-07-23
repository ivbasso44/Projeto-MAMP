"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog" // Importe DialogFooter
import { Button } from "@/components/ui/button" // Importe Button
import { getTaskHistory, exportTaskHistoryToXlsx } from "@/actions/tasks" // Importe a nova action
import type { TaskHistory } from "@/types/supabase"
import { formatDate, base64ToArrayBuffer } from "@/lib/utils" // Importe base64ToArrayBuffer
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Download } from "lucide-react" // Importe o ícone Download
import { useToast } from "@/hooks/use-toast" // Importe o hook useToast

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskName: string
}

export function HistoryModal({ isOpen, onClose, taskId, taskName }: HistoryModalProps) {
  const [history, setHistory] = useState<TaskHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      const fetchHistory = async () => {
        setIsLoading(true)
        const data = await getTaskHistory(taskId)
        setHistory(data)
        setIsLoading(false)
      }
      fetchHistory()
    }
  }, [isOpen, taskId])

  const handleExportHistory = async () => {
    setIsExporting(true)
    const result = await exportTaskHistoryToXlsx(taskId, taskName)
    if (result.success && result.xlsxData) {
      // Converte a string Base64 de volta para ArrayBuffer
      const arrayBuffer = base64ToArrayBuffer(result.xlsxData)
      const blob = new Blob([arrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const link = document.createElement("a")
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `historico_${taskName.replace(/\s/g, "_")}.xlsx`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url) // Libera a URL do objeto
        // toast({
        //   title: "Sucesso!",
        //   description: result.message,
        // })
      }
    } else {
      // toast({
      //   title: "Erro na Exportação",
      //   description: result.message || "Não foi possível exportar o histórico da tarefa.",
      //   variant: "destructive",
      // })
    }
    setIsExporting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Histórico de Execução: {taskName}</DialogTitle>
          <DialogDescription>Todas as execuções registradas para esta tarefa.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Carregando histórico...</div>
          ) : history.length === 0 ? (
            <div className="text-center text-muted-foreground">Nenhum histórico encontrado para esta tarefa.</div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              {history.map((entry, index) => (
                <div key={entry.id} className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Executado em: {formatDate(entry.executed_at || null)}</span>
                    <span className="text-sm text-muted-foreground">Por: {entry.executed_by || "N/A"}</span>
                  </div>
                  {entry.observation && (
                    <p className="text-sm text-muted-foreground mt-1">Observação: {entry.observation}</p>
                  )}
                  {index < history.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleExportHistory} disabled={isLoading || isExporting || history.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exportando..." : "Exportar Histórico (XLSX)"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
