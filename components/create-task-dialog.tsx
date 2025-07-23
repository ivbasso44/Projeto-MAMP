"use client"

import { CommandEmpty } from "@/components/ui/command"

import { CommandGroup } from "@/components/ui/command"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { createTask } from "@/actions/tasks"
import { TASK_NAME_OPTIONS, WORK_STATION_OPTIONS } from "@/lib/constants"
import { ChevronsUpDown } from "lucide-react"
import type { TaskWithDefinition } from "@/types/supabase" // Alterado para TaskWithDefinition
import { useToast } from "@/hooks/use-toast"

interface CreateTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated: (newInstance: TaskWithDefinition) => void // Alterado para TaskWithDefinition
}

export function CreateTaskDialog({ isOpen, onClose, onTaskCreated }: CreateTaskDialogProps) {
  const [taskName, setTaskName] = useState<string>("")
  const [selectedWorkStations, setSelectedWorkStations] = useState<string[]>([])
  const [frequencyDays, setFrequencyDays] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async () => {
    setError(null)
    setIsLoading(true)

    const freq = Number.parseInt(frequencyDays)
    if (!taskName || selectedWorkStations.length === 0 || isNaN(freq) || freq <= 0) {
      setError("Por favor, preencha todos os campos obrigatórios e insira uma frequência válida.")
      setIsLoading(false)
      return
    }

    const result = await createTask({
      name: taskName,
      workStations: selectedWorkStations,
      frequencyDays: freq,
    })

    if (result.success && result.newInstance) {
      onTaskCreated(result.newInstance)
      toast({
        title: "Sucesso!",
        description: result.toastMessage,
        variant: "default",
      })
      // Reset form
      setTaskName("")
      setSelectedWorkStations([])
      setFrequencyDays("")
      onClose()
    } else {
      setError(result.message || "Erro desconhecido ao criar a tarefa.")
      toast({
        title: "Erro",
        description: result.toastMessage || "Não foi possível criar a tarefa.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleWorkStationToggle = (station: string) => {
    setSelectedWorkStations((prev) => (prev.includes(station) ? prev.filter((s) => s !== station) : [...prev, station]))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
          <DialogDescription>Preencha os detalhes para adicionar uma nova tarefa de manutenção.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
            {" "}
            {/* Responsivo */}
            <Label htmlFor="taskName" className="text-left sm:text-right">
              {" "}
              {/* Responsivo */}
              Nome da Tarefa
            </Label>
            <Select onValueChange={setTaskName} value={taskName} disabled={isLoading}>
              <SelectTrigger className="col-span-1 sm:col-span-3">
                {" "}
                {/* Responsivo */}
                <SelectValue placeholder="Selecione o nome da tarefa" />
              </SelectTrigger>
              <SelectContent>
                {TASK_NAME_OPTIONS.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
            {" "}
            {/* Responsivo */}
            <Label htmlFor="workStations" className="text-left sm:text-right">
              {" "}
              {/* Responsivo */}
              Postos de Trabalho
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="col-span-1 justify-between bg-transparent sm:col-span-3"
                  disabled={isLoading}
                >
                  {" "}
                  {/* Responsivo */}
                  {selectedWorkStations.length > 0
                    ? `${selectedWorkStations.length} selecionado(s)`
                    : "Selecione postos de trabalho..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(var(--radix-popover-trigger-width))] p-0">
                <Command>
                  <CommandInput placeholder="Buscar posto..." />
                  <CommandList>
                    <CommandEmpty>Nenhum posto encontrado.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      {WORK_STATION_OPTIONS.map((station) => (
                        <CommandItem
                          key={station}
                          onSelect={() => handleWorkStationToggle(station)}
                          className="flex items-center gap-2"
                        >
                          <Checkbox checked={selectedWorkStations.includes(station)} />
                          {station}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
            {" "}
            {/* Responsivo */}
            <Label htmlFor="frequency" className="text-left sm:text-right">
              {" "}
              {/* Responsivo */}
              Frequência (dias)
            </Label>
            <Input
              id="frequency"
              type="number"
              value={frequencyDays}
              onChange={(e) => setFrequencyDays(e.target.value)}
              className="col-span-1 sm:col-span-3"
              min="1"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
