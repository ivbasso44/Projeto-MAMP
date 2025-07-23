import { getTasks } from "@/actions/tasks"
import { TaskTable } from "@/components/task-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskCalendar } from "@/components/task-calendar"
import { GanttChart } from "@/components/gantt-chart"
import type { TaskInstance, TaskWithDefinition, AggregatedTaskDisplay } from "@/types/supabase" // Importe os novos tipos

export const dynamic = "force-dynamic" // Garante que os dados sejam sempre frescos

// Função para agregar as tarefas para exibição
function aggregateTasksForDisplay(tasksWithDefinition: TaskWithDefinition[]): AggregatedTaskDisplay[] {
  const groupedTasks = new Map<string, AggregatedTaskDisplay>()

  tasksWithDefinition.forEach((task) => {
    if (!groupedTasks.has(task.name)) {
      // Se é a primeira vez que vemos este nome de tarefa, inicialize
      groupedTasks.set(task.name, {
        id: task.id, // Usamos o ID da primeira instância como ID representativo
        task_definition_id: task.task_definition_id,
        name: task.name,
        work_stations: [...task.work_stations], // Copia os postos de trabalho
        frequency_days: task.frequency_days, // Usa a frequência da primeira instância
        last_executed_at: task.last_executed_at,
        next_due_at: task.next_due_at,
        originalInstances: [task], // Armazena a instância original
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

      // Atualiza a última execução (pega a mais recente)
      if (task.last_executed_at) {
        if (!existing.last_executed_at || new Date(task.last_executed_at) > new Date(existing.last_executed_at)) {
          existing.last_executed_at = task.last_executed_at
        }
      }

      // Atualiza a próxima execução (pega a mais antiga/próxima a vencer)
      if (task.next_due_at) {
        if (!existing.next_due_at || new Date(task.next_due_at) < new Date(existing.next_due_at)) {
          existing.next_due_at = task.next_due_at
          // Se a próxima execução mais antiga for desta tarefa, use o ID e a frequência dela como representativos
          existing.id = task.id
          existing.frequency_days = task.frequency_days
        }
      }

      existing.originalInstances.push(task) // Adiciona a instância original à lista
    }
  })

  // Converte o Map de volta para um array e ordena pela próxima data de vencimento
  return Array.from(groupedTasks.values()).sort((a, b) => {
    if (!a.next_due_at && !b.next_due_at) return 0
    if (!a.next_due_at) return 1
    if (!b.next_due_at) return -1
    return new Date(a.next_due_at).getTime() - new Date(b.next_due_at).getTime()
  })
}

export default async function Home() {
  const tasksWithDefinition = await getTasks() // Agora retorna TaskWithDefinition[]
  const aggregatedTasks = aggregateTasksForDisplay(tasksWithDefinition)

  // Para o calendário, passamos as instâncias originais (TaskInstance)
  // para que ele possa marcar todos os pontos de vencimento individuais.
  // Precisamos extrair as TaskInstances de TaskWithDefinition.
  const allTaskInstances: TaskInstance[] = tasksWithDefinition.map((task) => {
    const { name, ...instance } = task // Remove 'name' para obter TaskInstance
    return instance
  })

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-screen-2xl mx-auto my-8 px-4 py-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold text-center">MEIOS AUXILIARES E MEDIÇÃO PARA PRODUÇÃO</CardTitle>
          <CardDescription className="text-center">
            Gerenciamento de tarefas de manutenção com histórico, agendamento e visualização em calendário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="table">Lista de Tarefas</TabsTrigger>
              <TabsTrigger value="calendar">Calendário de Prazos</TabsTrigger>
              <TabsTrigger value="gantt">Gráfico de Gantt</TabsTrigger>
            </TabsList>
            <TabsContent value="table" className="mt-4">
              <TaskTable initialTasks={aggregatedTasks} /> {/* Passa as tarefas agregadas */}
            </TabsContent>
            <TabsContent value="calendar" className="mt-4">
              <TaskCalendar tasks={allTaskInstances} /> {/* O calendário agora usa as instâncias originais */}
            </TabsContent>
            <TabsContent value="gantt" className="mt-4">
              <GanttChart tasks={aggregatedTasks} /> {/* Passa as tarefas agregadas */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
