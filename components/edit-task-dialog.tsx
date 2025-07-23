"use client"

import { CommandGroup } from "@/components/ui/command"
import { CommandEmpty } from "@/components/ui/command"
import { useEffect, useState } from "react"
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
import { editTask } from "@/actions/tasks"
import { TASK_NAME_OPTIONS, WORK_STATION_OPTIONS } from "@/lib/constants"
import { ChevronsUpDown } from "lucide-react"
import type { TaskWithDefinition, TaskInstance } from "@/types/supabase" // Alterado para TaskWithDefinition, TaskInstance
import { useToast } from "@/hooks/use-toast"

interface EditTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  taskInstance: TaskInstance | null // A instância da tarefa a ser editada
  taskName: string // O nome da definição da tarefa
  onTaskUpdated: (updatedInstance: TaskWithDefinition) => void // Alterado para TaskWithDefinition
}

export function EditTaskDialog({ isOpen, onClose, taskInstance, taskName, onTaskUpdated }: EditTaskDialogProps) {
  const [currentTaskName, setCurrentTaskName] = useState<string>("") // Nome da definição
  const [selectedWorkStations, setSelectedWorkStations] = useState<string[]>([])
  const [frequencyDays, setFrequencyDays] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Preenche o formulário quando a tarefa muda ou o modal abre
  useEffect(() => {
    if (taskInstance) {
      setCurrentTaskName(taskName) // Usa o nome da definição passado
      setSelectedWorkStations(taskInstance.work_stations || [])
      setFrequencyDays(taskInstance.frequency_days.toString())
      setError(null) // Limpa erros anteriores
    }
  }, [taskInstance, taskName])

  const handleSubmit = async () => {
    setError(null)
    setIsLoading(true)

    if (!taskInstance) {
      setError("Nenhuma instância de tarefa selecionada para edição.")
      setIsLoading(false)
      return
    }

    const freq = Number.parseInt(frequencyDays)
    if (!currentTaskName || selectedWorkStations.length === 0 || isNaN(freq) || freq <= 0) {
      setError("Por favor, preencha todos os campos obrigatórios e insira uma frequência válida.")
      setIsLoading(false)
      return
    }

    const result = await editTask({
      id: taskInstance.id, // ID da instância
      name: currentTaskName, // Nome da definição
      workStations: selectedWorkStations,
      frequencyDays: freq,
    })

    if (result.success && result.updatedInstance) {
      onTaskUpdated(result.updatedInstance)
      toast({
        title: "Sucesso!",
        description: result.toastMessage,
        variant: "default",
      })
      onClose()
    } else {
      setError(result.message || "Erro desconhecido ao editar a tarefa.")
      toast({
        title: "Erro",
        description: result.toastMessage || "Não foi possível editar a tarefa.",
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
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>Modifique os detalhes da instância da tarefa selecionada.</DialogDescription>
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
            <Select onValueChange={setCurrentTaskName} value={currentTaskName} disabled={isLoading}>
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
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
