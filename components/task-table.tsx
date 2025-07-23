"use client"

import { SetStateAction, useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
// Update the import path if the file is located elsewhere, for example:
import { Button } from "../components/ui/button"
// Or, if the file does not exist, create 'button.tsx' in 'components/ui' with the Button component.
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { ArrowDown, ArrowUp, Import, MoreHorizontal, Share2 } from "lucide-react"
// import type { taskSchema } from "@/lib/validations/task"
// Atualize o caminho abaixo para o local correto do seu arquivo de validação de tarefas
// import type { taskSchema } from "../lib/validations/task"
// Atualize o caminho abaixo para o local correto do seu arquivo de validação de tarefas
// import { taskSchema } from "../lib/validations/task"
// Corrija o caminho abaixo para o local correto do seu arquivo de validação de tarefas
// Update the path below to the correct location of your task validation schema
// import { taskSchema } from "../lib/validations/task"
// Update the path below to the correct location of your task validation schema
// import { taskSchema } from "../lib/validations/task"
// Update the path below to the correct location of your task validation schema
import { taskSchema } from "../lib/validations/task"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form"
import { Textarea } from "../components/ui/textarea"
import { DatePicker } from "../components/ui/date-picker"
// Simple cn utility to join class names
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
import { format } from "date-fns"
import { ExportTasks } from "../components/export-tasks"
import { ImportTasks } from "../components/import-tasks"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation" // Importe useRouter
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

import { AggregatedTaskDisplay } from "../types/supabase"

export type Task = z.infer<typeof taskSchema>

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
  const { toast } = useToast()
  const router = useRouter() // Inicialize useRouter

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
                  toast({
                    title: "Copiado para área de transferência.",
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

  const deleteAllTasksFormSchema = z.object({
    title: z.string().min(2, {
      message: "Título deve ter pelo menos 2 caracteres.",
    }),
    description: z.string().min(10, {
      message: "Descrição deve ter pelo menos 10 caracteres.",
    }),
    due_date: z.date(),
  })

  type DeleteAllTasksFormValues = z.infer<typeof deleteAllTasksFormSchema>

  const deleteAllTasksForm = useForm<DeleteAllTasksFormValues>({
    resolver: zodResolver(deleteAllTasksFormSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: new Date(),
    },
  })

  const handleDeleteAllTasks = async () => {
    // Atualize o caminho abaixo para o local correto do seu arquivo de actions
    // Certifique-se de que o nome da função corresponde ao export do arquivo ../actions/tasks
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
      toast({
        title: "Sucesso!",
        description: result.message,
      })
      router.refresh() // Força a revalidação dos dados no servidor
    } else {
      toast({
        title: "Erro ao Excluir",
        description: result.message || "Não foi possível excluir todas as tarefas.",
      })
    }
  }

  return (
    <>
      <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Tarefa</DialogTitle>
            <DialogDescription>Crie uma nova tarefa para sua lista de tarefas.</DialogDescription>
          </DialogHeader>
          <Form {...deleteAllTasksForm}>
            <form onSubmit={deleteAllTasksForm.handleSubmit((data) => console.log(data))} className="space-y-4">
              <FormField
                control={deleteAllTasksForm.control}
                name="title"
                render={({ field }: { field: any }) => {
                  return (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Comprar pão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={deleteAllTasksForm.control}
                name="description"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Comprar pão na padaria da esquina" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={deleteAllTasksForm.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Vencimento</FormLabel>
                    <DatePicker
                      onSelect={field.onChange}
                      className={cn(
                        "peer h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        field.value ? "text-foreground" : "text-muted-foreground",
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Criar</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportTasksDialogOpen} onOpenChange={setIsImportTasksDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Importar Tarefas</DialogTitle>
            <DialogDescription>Importe tarefas de um arquivo CSV.</DialogDescription>
          </DialogHeader>
          <ImportTasks setTasks={setTasks} onClose={() => setIsImportTasksDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Input placeholder="Buscar tarefas..." value={searchTerm} onChange={(e: { target: { value: SetStateAction<string> } }) => setSearchTerm(e.target.value)} />
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsImportTasksDialogOpen(true)}>
              <Import className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <ExportTasks
              tasks={tasks}
              disabled={isExporting}
              onStart={() => setIsExporting(true)}
              onEnd={() => setIsExporting(false)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Exportar
            </ExportTasks>
            <Button onClick={() => setIsCreateTaskDialogOpen(true)} className="w-full sm:w-auto">
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
