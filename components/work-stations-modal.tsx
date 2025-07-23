"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface WorkStationsModalProps {
  isOpen: boolean
  onClose: () => void
  taskName: string
  workStations: string[]
}

export function WorkStationsModal({ isOpen, onClose, taskName, workStations }: WorkStationsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Postos de Trabalho para: {taskName}</DialogTitle>
          <DialogDescription>Todos os postos de trabalho associados a esta tarefa.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {workStations.length === 0 ? (
            <p className="text-muted-foreground">Nenhum posto de trabalho registrado para esta tarefa.</p>
          ) : (
            <ScrollArea className="h-[200px] pr-4">
              <div className="flex flex-wrap gap-2">
                {workStations.map((station, index) => (
                  <Badge key={index} variant="secondary" className="text-base px-3 py-1">
                    {station}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
