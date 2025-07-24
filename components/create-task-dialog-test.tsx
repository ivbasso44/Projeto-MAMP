"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

interface CreateTaskDialogTestProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated: (newTask: any) => void
}

export function CreateTaskDialogTest({ isOpen, onClose, onTaskCreated }: CreateTaskDialogTestProps) {
  const [taskName, setTaskName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  console.log("CreateTaskDialogTest renderizado, isOpen:", isOpen)

  const handleSubmit = () => {
    console.log("✅ Formulário enviado!")
    console.log("Nome da tarefa:", taskName)
    
    // Simula criação da tarefa
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onTaskCreated({ name: taskName, id: "test-" + Date.now() })
      setTaskName("")
      onClose()
      alert("✅ Tarefa criada: " + taskName)
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log("Dialog onOpenChange:", open)
      if (!open) onClose()
    }}>
      <DialogContent 
        className="sm:max-w-[425px] z-50"
        style={{ zIndex: 9999 }}
      >
        <DialogHeader>
          <DialogTitle>🧪 Teste - Criar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Versão simplificada para testar funcionalidade do modal.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={taskName}
              onChange={(e) => {
                console.log("Input mudou:", e.target.value)
                setTaskName(e.target.value)
              }}
              placeholder="Nome da tarefa"
              className="col-span-3"
              disabled={isLoading}
              onClick={() => console.log("✅ Input clicado!")}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Teste
            </Label>
            <div className="col-span-3">
              <p className="text-sm text-gray-600">
                Digitado: "{taskName}"
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              console.log("✅ Botão Cancelar clicado!")
              onClose()
            }} 
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              console.log("✅ Botão Criar clicado!")
              handleSubmit()
            }} 
            disabled={isLoading || !taskName.trim()}
          >
            {isLoading ? "Criando..." : "Criar Tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
