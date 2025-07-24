import { getTasks } from "../actions/tasks"
import { TaskTableStep2 } from "../components/task-table-step2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
// import { TaskCalendar } from "../components/task-calendar"
// import { GanttChart } from "../components/gantt-chart"
import type { TaskInstance, TaskWithDefinition } from "../types/supabase"
import type { AggregatedTaskDisplay } from "../types/supabase"

export const dynamic = "force-dynamic" // Garante que os dados sejam sempre frescos

// Função para agregar as tarefas para exibição
function aggregateTasksForDisplay(tasksWithDefinition: TaskWithDefinition[]): AggregatedTaskDisplay[] {
  const groupedTasks = new Map<string, AggregatedTaskDisplay>()

  if (!tasksWithDefinition || tasksWithDefinition.length === 0) {
    return []
  }

  tasksWithDefinition.forEach((task) => {
    if (!groupedTasks.has(task.name)) {
      // Se é a primeira vez que vemos este nome de tarefa, inicialize
      groupedTasks.set(task.name, {
        id: task.id, // Usamos o ID da primeira instância como ID representativo
        task_definition_id: task.task_definition_id, // Adiciona o campo obrigatório
        name: task.name,
        work_stations: [...task.work_stations], // Copia os postos de trabalho
        frequency_days: task.frequency_days, // Usa a frequência da primeira instância
        last_executed_at: task.last_executed_at,
        next_due_at: task.next_due_at ? task.next_due_at : undefined, // Garante string ou undefined
        instances: [task], // Adiciona a propriedade instances
        originalInstances: [task], // Armazena a instância original
        // Adicione os campos esperados pelo TaskTable
        status: "pending", // ou lógica para determinar status
        title: task.name, // ou outro campo apropriado
        description: task.description !== undefined ? task.description : "", // garante string
        created_at: task.created_at ? new Date(task.created_at) : undefined,
        updated_at: task.updated_at ? new Date(task.updated_at) : undefined,
        project_id: task.project_id ?? undefined,
        project_name: "Projeto Geral", // Adiciona o nome do projeto
      })
    } else {
      // Se o nome da tarefa já existe, atualize os dados agregados
      const existing = groupedTasks.get(task.name)!

      // Agrega postos de trabalho únicos
      task.work_stations.forEach((ws) => {
        if (!existing.work_stations.includes(ws)) {
          existing.work_stations.push(ws)
        }
      })

      // Adiciona a instância
      existing.instances.push(task)
      existing.originalInstances.push(task)

      // Atualiza para a próxima data de vencimento mais recente
      if (!existing.next_due_at || (task.next_due_at && task.next_due_at < existing.next_due_at)) {
        existing.next_due_at = task.next_due_at
      }

      // Atualiza para a última execução mais recente
      if (!existing.last_executed_at || (task.last_executed_at && task.last_executed_at > existing.last_executed_at)) {
        existing.last_executed_at = task.last_executed_at
      }
    }
  })

  return Array.from(groupedTasks.values())
}

export default async function HomePage() {
  let initialTasks: AggregatedTaskDisplay[] = []
  
  try {
    const tasksWithDefinition = await getTasks()
    initialTasks = aggregateTasksForDisplay(tasksWithDefinition)
  } catch (error) {
    console.error("Error loading tasks:", error)
    // Continue com array vazio se houver erro
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Sistema de Gestão de Tarefas</h1>
      
      {/* Mostra uma mensagem se não há tarefas */}
      {initialTasks.length === 0 && (
        <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Bem-vindo ao Sistema de Tarefas!</h2>
          <p className="text-gray-500">
            Você pode começar criando uma nova tarefa ou importando dados existentes.
          </p>
        </div>
      )}

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Tarefas</CardTitle>
              <CardDescription>Gerencie suas tarefas e acompanhe o progresso</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskTableStep2 />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Tarefas</CardTitle>
              <CardDescription>Visualize suas tarefas em formato de calendário</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-center">
                <p>Calendário temporariamente desabilitado para debug</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gantt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gráfico de Gantt</CardTitle>
              <CardDescription>Visualize o cronograma das tarefas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-center">
                <p>Gantt temporariamente desabilitado para debug</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
