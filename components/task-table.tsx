"use client"

import { SetStateAction, useState, useEffect } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { ArrowDown, ArrowUp, Import, MoreHorizontal, Share2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog"
import { format } from "date-fns"

import { AggregatedTaskDisplay } from "../types/supabase"
import { CreateTaskDialog } from "./create-task-dialog"
import { toast } from "sonner"

interface TaskTableProps {
  initialTasks: AggregatedTaskDisplay[]
}

export function TaskTable({ initialTasks }: TaskTableProps) {
  const [tasks, setTasks] = useState<AggregatedTaskDisplay[]>(initialTasks)
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false)
  const [isImportTasksDialogOpen, setIsImportTasksDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortColumn, setSortColumn] = useState<keyof AggregatedTaskDisplay | "status" | null>("next_due_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isExporting, setIsExporting] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Garante que só renderiza botões após hidratação
  useEffect(() => {
    setIsClient(true)
  }, [])

  const columns: ColumnDef<AggregatedTaskDisplay>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              setSortColumn("title")
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }}
          >
            Título
            {sortColumn === "title" &&
              (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
          </Button>
        )
      },
    },
    {
      accessorKey: "project_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              setSortColumn("project_name")
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }}
          >
            Projeto
            {sortColumn === "project_name" &&
              (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
          </Button>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Descrição",
    },
    {
      accessorKey: "next_due_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              setSortColumn("next_due_at")
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }}
          >
            Data de Vencimento
            {sortColumn === "next_due_at" &&
              (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("next_due_at") as Date
        return <div>{date ? format(date, "dd/MM/yyyy") : "Sem data"}</div>
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              setSortColumn("status")
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }}
          >
            Status
            {sortColumn === "status" &&
              (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
          </Button>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(task.id)
                  toast.success("Copiado para área de transferência.", {
                    description: "ID da tarefa copiado.",
                  })
                }}
              >
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: tasks.filter((task) => task.title.toLowerCase().includes(searchTerm.toLocaleLowerCase())),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: (column) => {
      console.log(column)
    },
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          id: String(sortColumn ?? "next_due_at"),
          desc: sortDirection === "desc",
        },
      ],
    },
  })

  const handleDeleteAllTasks = async () => {
    try {
      const tasksActions = await import("../actions/tasks")
      // Delete all tasks by calling deleteTask for each instance
      let success = true
      let message = "Todas as tarefas foram excluídas com sucesso."
      for (const task of tasks) {
        const result = await tasksActions.deleteTask(task.id)
        if (!result.success) {
          success = false
          message = result.message || "Erro ao excluir uma ou mais tarefas."
          break
        }
      }
      const result = { success, message }

      if (result.success) {
        setTasks([]) // Limpa o estado local das tarefas
        toast.success("Sucesso!", {
          description: result.message,
        })
        window.location.reload() // Força a revalidação dos dados no servidor
      } else {
        toast.error("Erro ao Excluir", {
          description: result.message || "Não foi possível excluir todas as tarefas.",
        })
      }
    } catch (error) {
      console.error("Error deleting tasks:", error)
      toast.error("Erro inesperado ao excluir tarefas.")
    }
  }

  const handleTaskCreated = (newTask: any) => {
    console.log("Tarefa criada:", newTask)
    // Refresh the page to show the new task
    window.location.reload()
  }

  console.log("TaskTable renderizado, isCreateTaskDialogOpen:", isCreateTaskDialogOpen, "isClient:", isClient)

  if (!isClient) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <CreateTaskDialog 
        isOpen={isCreateTaskDialogOpen}
        onClose={() => {
          console.log("Fechando dialog CreateTask")
          setIsCreateTaskDialogOpen(false)
        }}
        onTaskCreated={handleTaskCreated}
      />

      <Dialog open={isImportTasksDialogOpen} onOpenChange={setIsImportTasksDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Importar Tarefas</DialogTitle>
            <DialogDescription>Importe tarefas de um arquivo CSV.</DialogDescription>
          </DialogHeader>
          {/* <ImportTasks setTasks={setTasks} onClose={() => setIsImportTasksDialogOpen(false)} /> */}
          <div className="p-4">
            <p>Funcionalidade de importação em desenvolvimento...</p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4">
        {/* Teste de Funcionalidade dos Botões */}
        <div className="bg-yellow-100 p-4 rounded-lg border">
          <h3 className="font-bold mb-2">🔧 TESTE DOS BOTÕES:</h3>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => {
                console.log("✅ Botão HTML básico funcionou!")
                alert("✅ HTML Button OK!")
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Teste HTML
            </button>
            
            <Button 
              onClick={() => {
                console.log("✅ Button component funcionou!")
                alert("✅ Button Component OK!")
              }}
              variant="outline"
            >
              Teste Button Component
            </Button>
            
            <Button 
              onClick={() => {
                console.log("✅ Teste de função setIsCreateTaskDialogOpen")
                setIsCreateTaskDialogOpen(true)
              }}
              variant="default"
            >
              Teste Abrir Dialog
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Input placeholder="Buscar tarefas..." value={searchTerm} onChange={(e: { target: { value: SetStateAction<string> } }) => setSearchTerm(e.target.value)} />
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsImportTasksDialogOpen(true)}>
              <Import className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button disabled>
              <Share2 className="mr-2 h-4 w-4" />
              Exportar (em desenvolvimento)
            </Button>
            <Button onClick={() => {
              console.log("Botão Criar Nova Tarefa clicado!")
              setIsCreateTaskDialogOpen(true)
            }} className="w-full sm:w-auto">
              Criar Nova Tarefa
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Todas
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente todas as suas tarefas e removerá seus
                    dados de nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllTasks}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-row={JSON.stringify(row.original)}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nenhum resultado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Próximo
          </Button>
        </div>
      </div>
    </>
  )
}
