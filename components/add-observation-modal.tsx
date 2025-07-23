"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface AddObservationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (observation: string | null) => void
  isLoading: boolean
}

export function AddObservationModal({ isOpen, onClose, onConfirm, isLoading }: AddObservationModalProps) {
  const [observation, setObservation] = useState<string>("")

  const handleSubmit = () => {
    onConfirm(observation.trim() === "" ? null : observation)
    setObservation("") // Limpa a observação após o envio
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Observação</DialogTitle>
          <DialogDescription>Adicione uma observação para esta execução da tarefa (opcional).</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="observation">Observação</Label>
            <Textarea
              id="observation"
              placeholder="Ex: Verificação concluída com sucesso, sem anomalias."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Confirmar Conclusão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
