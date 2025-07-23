"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"
import { addDaysAndAdjustForWeekends, formatDate, arrayBufferToBase64 } from "@/lib/utils" // Updated import
import type { TaskInstance, TaskHistory, TaskDefinition, TaskWithDefinition } from "@/types/supabase"
import ExcelJS from "exceljs"

export async function getTasks(): Promise<TaskWithDefinition[]> {
  const supabase = createServerClient()
  // Busca todas as instâncias e faz um JOIN com as definições para obter o nome
  const { data, error } = await supabase
    .from("task_instances")
    .select("*, task_definitions(name)") // Seleciona tudo de instances e o nome da definição
    .order("next_due_at", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  // Mapeia os dados para o tipo TaskWithDefinition
  return data.map((item) => ({
    ...item,
    name: (item.task_definitions as { name: string }).name, // Extrai o nome da definição
  }))
}

export async function markTaskAsDone(
  instanceId: string, // Agora é instanceId
  observation: string | null,
): Promise<{ success: boolean; message?: string; updatedInstance?: TaskInstance; toastMessage?: string }> {
  const supabase = createServerClient()

  // 1. Obter a instância da tarefa atual para pegar a frequência e o task_definition_id
  const { data: instance, error: fetchError } = await supabase
    .from("task_instances")
    .select("frequency_days, task_definition_id")
    .eq("id", instanceId)
    .single()

  if (fetchError || !instance) {
    console.error("Error fetching task instance for update:", fetchError)
    return {
      success: false,
      message: "Erro ao buscar a instância da tarefa.",
      toastMessage: "Erro ao buscar a tarefa.",
    }
  }

  const now = new Date()
  const nextDueDate = addDaysAndAdjustForWeekends(now, instance.frequency_days) // Updated function call

  // 2. Atualizar a instância da tarefa
  const { data: updatedInstanceData, error: updateError } = await supabase
    .from("task_instances")
    .update({
      last_executed_at: now.toISOString(),
      next_due_at: nextDueDate.toISOString(),
    })
    .eq("id", instanceId)
    .select("*") // Retorna a instância atualizada
    .single()

  if (updateError || !updatedInstanceData) {
    console.error("Error updating task instance:", updateError)
    return {
      success: false,
      message: "Erro ao atualizar a instância da tarefa.",
      toastMessage: "Erro ao atualizar a tarefa.",
    }
  }

  // 3. Inserir no histórico (com usuário padrão)
  const { error: historyError } = await supabase.from("task_history").insert({
    task_id: instanceId,
    executed_at: now.toISOString(),
    observation: observation,
    executed_by: "Sistema (Sem Login)", // Valor padrão, já que não há login
  })

  if (historyError) {
    console.error("Error inserting task history:", historyError)
    return {
      success: false,
      message: "Instância da tarefa atualizada, mas erro ao registrar histórico.",
      toastMessage: "Tarefa atualizada, mas erro ao registrar histórico.",
    }
  }

  revalidatePath("/") // Revalida o cache da página principal para mostrar as atualizações
  return {
    success: true,
    message: "Tarefa marcada como concluída e próxima data agendada!",
    updatedInstance: updatedInstanceData,
    toastMessage: "Tarefa marcada como concluída!",
  }
}

export async function getTaskHistory(instanceId: string): Promise<TaskHistory[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("task_history")
    .select("*")
    .eq("task_id", instanceId)
    .order("executed_at", { ascending: false })

  if (error) {
    console.error("Error fetching task history:", error)
    return []
  }
  return data
}

export async function createTask({
  name,
  workStations: selectedWorkStations,
  frequencyDays: freq,
}: {
  name: string
  workStations: string[]
  frequencyDays: number
}): Promise<{ success: boolean; message?: string; newInstance?: TaskWithDefinition; toastMessage?: string }> {
  const supabase = createServerClient()

  // Validação básica
  if (!name || selectedWorkStations.length === 0 || isNaN(freq) || freq <= 0) {
    return {
      success: false,
      message: "Por favor, preencha todos os campos obrigatórios e insira uma frequência válida.",
      toastMessage: "Preencha todos os campos.",
    }
  }

  // 1. Encontrar ou criar a definição da tarefa
  let taskDefinition: TaskDefinition | null = null
  const { data: existingDefinition, error: definitionError } = await supabase
    .from("task_definitions")
    .select("*")
    .eq("name", name)
    .single()

  if (definitionError && definitionError.code !== "PGRST116") {
    // PGRST116 means "No rows found"
    console.error("Error fetching task definition:", definitionError)
    return { success: false, message: "Erro ao buscar definição da tarefa.", toastMessage: "Erro ao buscar definição." }
  }

  if (existingDefinition) {
    taskDefinition = existingDefinition
  } else {
    const { data: newDefinition, error: createDefinitionError } = await supabase
      .from("task_definitions")
      .insert({ name: name })
      .select("*")
      .single()

    if (createDefinitionError || !newDefinition) {
      console.error("Error creating task definition:", createDefinitionError)
      return { success: false, message: "Erro ao criar definição da tarefa.", toastMessage: "Erro ao criar definição." }
    }
    taskDefinition = newDefinition
  }

  // Calcular a próxima data de vencimento a partir de hoje
  const now = new Date()
  const nextDueDate = addDaysAndAdjustForWeekends(now, freq) // Updated function call

  // Dentro da função `createTask`, antes da inserção em `task_instances`:
  const newInstanceId = crypto.randomUUID()

  // 2. Inserir a nova instância da tarefa
  const { data: newInstanceData, error: instanceError } = await supabase
    .from("task_instances")
    .insert({
      id: newInstanceId, // Adicionado o ID gerado
      task_definition_id: taskDefinition.id,
      work_stations: selectedWorkStations,
      frequency_days: freq,
      last_executed_at: null, // Nova instância não foi executada ainda
      next_due_at: nextDueDate.toISOString(),
    })
    .select("*")
    .single()

  if (instanceError || !newInstanceData) {
    console.error("Error creating task instance:", instanceError)
    return { success: false, message: "Erro ao criar a instância da tarefa.", toastMessage: "Erro ao criar instância." }
  }

  revalidatePath("/") // Revalida o cache da página principal
  return {
    success: true,
    message: "Tarefa criada com sucesso!",
    newInstance: { ...newInstanceData, name: taskDefinition.name }, // Retorna com o nome da definição
    toastMessage: "Tarefa criada com sucesso!",
  }
}

export async function editTask({
  id: instanceId, // Agora é instanceId
  name, // Nome da definição (para encontrar o ID da definição)
  workStations,
  frequencyDays,
}: {
  id: string
  name: string
  workStations: string[]
  frequencyDays: number
}): Promise<{ success: boolean; message?: string; updatedInstance?: TaskWithDefinition; toastMessage?: string }> {
  const supabase = createServerClient()

  if (!instanceId || !name || !workStations || workStations.length === 0 || !frequencyDays || frequencyDays <= 0) {
    return {
      success: false,
      message: "Todos os campos obrigatórios devem ser preenchidos.",
      toastMessage: "Preencha todos os campos.",
    }
  }

  // 1. Encontrar a definição da tarefa pelo nome
  const { data: taskDefinition, error: definitionError } = await supabase
    .from("task_definitions")
    .select("id")
    .eq("name", name)
    .single()

  if (definitionError || !taskDefinition) {
    console.error("Error fetching task definition for edit:", definitionError)
    return { success: false, message: "Definição da tarefa não encontrada.", toastMessage: "Definição não encontrada." }
  }

  // 2. Atualizar a instância da tarefa
  const { data: updatedInstanceData, error: updateError } = await supabase
    .from("task_instances")
    .update({
      task_definition_id: taskDefinition.id, // Garante que a instância está ligada à definição correta
      work_stations: workStations,
      frequency_days: frequencyDays,
    })
    .eq("id", instanceId)
    .select("*")
    .single()

  if (updateError || !updatedInstanceData) {
    console.error("Error editing task instance:", updateError)
    return { success: false, message: "Erro ao editar a instância da tarefa.", toastMessage: "Erro ao editar tarefa." }
  }

  revalidatePath("/")
  return {
    success: true,
    message: "Tarefa editada com sucesso!",
    updatedInstance: { ...updatedInstanceData, name: name }, // Retorna com o nome da definição
    toastMessage: "Tarefa editada com sucesso!",
  }
}

export async function deleteTask(
  instanceId: string, // Agora é instanceId
): Promise<{ success: boolean; message?: string; toastMessage?: string }> {
  const supabase = createServerClient()

  // 1. Obter a instância para saber qual definição ela pertence
  const { data: instance, error: fetchError } = await supabase
    .from("task_instances")
    .select("task_definition_id")
    .eq("id", instanceId)
    .single()

  if (fetchError || !instance) {
    console.error("Error fetching instance for deletion check:", fetchError)
    return {
      success: false,
      message: "Erro ao buscar instância para exclusão.",
      toastMessage: "Erro ao excluir tarefa.",
    }
  }

  const taskDefinitionId = instance.task_definition_id

  // 2. Excluir a instância da tarefa
  const { error: deleteError } = await supabase.from("task_instances").delete().eq("id", instanceId)

  if (deleteError) {
    console.error("Error deleting task instance:", deleteError)
    return {
      success: false,
      message: "Erro ao excluir a instância da tarefa.",
      toastMessage: "Erro ao excluir tarefa.",
    }
  }

  // 3. Verificar se esta era a última instância para esta definição de tarefa
  const { count, error: countError } = await supabase
    .from("task_instances")
    .select("id", { count: "exact" })
    .eq("task_definition_id", taskDefinitionId)

  if (countError) {
    console.error("Error counting instances for definition:", countError)
    // Não impede a exclusão da instância, apenas loga o erro
  } else if (count === 0) {
    // Se não houver mais instâncias para esta definição, exclua a definição também
    const { error: deleteDefinitionError } = await supabase.from("task_definitions").delete().eq("id", taskDefinitionId)

    if (deleteDefinitionError) {
      console.error("Error deleting task definition:", deleteDefinitionError)
      // Não impede a exclusão da instância, apenas loga o erro
    }
  }

  revalidatePath("/")
  return { success: true, message: "Tarefa excluída com sucesso!", toastMessage: "Tarefa excluída com sucesso!" }
}

export async function exportTasksToXlsx(): Promise<{ success: boolean; message?: string; xlsxData?: string }> {
  const supabase = createServerClient()

  // Busca todas as instâncias e faz um JOIN com as definições para obter o nome
  const { data: instances, error } = await supabase
    .from("task_instances")
    .select("*, task_definitions(name)")
    .order("next_due_at", { ascending: true })

  if (error) {
    console.error("Error fetching task instances for XLSX export:", error)
    return { success: false, message: "Erro ao buscar tarefas para exportação." }
  }

  if (!instances || instances.length === 0) {
    return { success: false, message: "Nenhuma tarefa encontrada para exportar." }
  }

  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Tarefas de Manutenção")

    // Definir cabeçalhos
    worksheet.columns = [
      { header: "ID da Instância", key: "id", width: 36 },
      { header: "Nome da Tarefa", key: "name", width: 30 }, // Nome da definição
      { header: "Postos de Trabalho", key: "work_stations", width: 40 },
      { header: "Frequência (dias)", key: "frequency_days", width: 18 },
      { header: "Última Execução", key: "last_executed_at", width: 20 },
      { header: "Próxima Execução", key: "next_due_at", width: 20 },
      { header: "Criado Em", key: "created_at", width: 20 },
    ]

    // Adicionar linhas de dados
    instances.forEach((instance) => {
      worksheet.addRow({
        id: instance.id,
        name: (instance.task_definitions as { name: string }).name, // Usa o nome da definição
        work_stations: instance.work_stations.join(", "),
        frequency_days: instance.frequency_days,
        last_executed_at: instance.last_executed_at ? formatDate(instance.last_executed_at) : "N/A",
        next_due_at: instance.next_due_at ? formatDate(instance.next_due_at) : "N/A",
        created_at: formatDate(instance.created_at),
      })
    })

    // Gerar o buffer XLSX
    const buffer = await workbook.xlsx.writeBuffer()
    const base64Data = arrayBufferToBase64(buffer) // Converte para Base64

    return { success: true, message: "Tarefas exportadas para XLSX com sucesso!", xlsxData: base64Data }
  } catch (exportError) {
    console.error("Error generating XLSX:", exportError)
    return { success: false, message: "Erro ao gerar o arquivo XLSX." }
  }
}

export async function importTasksFromXlsx(
  previousState: any, // Necessário para useActionState
  formData: FormData,
): Promise<{ success: boolean; message?: string; toastMessage?: string }> {
  const supabase = createServerClient()

  const file = formData.get("file") as File

  if (!file || file.size === 0) {
    return {
      success: false,
      message: "Nenhum arquivo selecionado.",
      toastMessage: "Selecione um arquivo para importar.",
    }
  }

  if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    return {
      success: false,
      message: "Formato de arquivo inválido. Por favor, use um arquivo .xlsx.",
      toastMessage: "Formato inválido. Use .xlsx.",
    }
  }

  try {
    const buffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const worksheet = workbook.getWorksheet(1) // Pega a primeira planilha

    if (!worksheet) {
      return {
        success: false,
        message: "Nenhuma planilha encontrada no arquivo XLSX.",
        toastMessage: "Nenhuma planilha encontrada.",
      }
    }

    // Definir os cabeçalhos esperados e seus índices (base 1 para ExcelJS)
    const expectedHeaders = {
      "Nome da Tarefa": 2, // Coluna B
      "Postos de Trabalho": 3, // Coluna C
      "Frequência (dias)": 4, // Coluna D
    }
    const actualHeaders: { [key: string]: number } = {}

    // Ler a primeira linha para verificar os cabeçalhos
    const headerRow = worksheet.getRow(1)
    if (!headerRow.values) {
      return {
        success: false,
        message: "O arquivo XLSX não contém cabeçalhos válidos na primeira linha.",
        toastMessage: "Cabeçalhos inválidos.",
      }
    }

    // Mapear os cabeçalhos reais para seus índices
    headerRow.eachCell((cell, colNumber) => {
      if (typeof cell.value === "string") {
        actualHeaders[cell.value.trim()] = colNumber
      }
    })

    // Verificar se todos os cabeçalhos esperados estão presentes e nos locais corretos
    for (const header in expectedHeaders) {
      if (!actualHeaders[header] || actualHeaders[header] !== expectedHeaders[header]) {
        return {
          success: false,
          message: `Cabeçalho "${header}" não encontrado ou na posição incorreta. Verifique a estrutura do arquivo.`,
          toastMessage: `Erro: Cabeçalho "${header}" ausente ou incorreto.`,
        }
      }
    }

    const importedInstances: Omit<TaskInstance, "created_at" | "task_definition_id">[] = [] // Removido 'id' daqui
    const taskDefinitionsToCreate: { name: string; id?: string }[] = []
    const taskDefinitionMap = new Map<string, string>() // Map<name, id>

    // Pré-carregar definições existentes para evitar duplicação
    const { data: existingDefinitions, error: fetchDefinitionsError } = await supabase
      .from("task_definitions")
      .select("id, name")

    if (fetchDefinitionsError) {
      console.error("Error fetching existing task definitions:", fetchDefinitionsError)
      return {
        success: false,
        message: "Erro ao carregar definições existentes.",
        toastMessage: "Erro ao carregar definições.",
      }
    }
    existingDefinitions?.forEach((def) => taskDefinitionMap.set(def.name, def.id))

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Pula o cabeçalho
        return
      }

      const name = row.getCell(actualHeaders["Nome da Tarefa"]).text?.trim()
      const workStationsString = row.getCell(actualHeaders["Postos de Trabalho"]).text?.trim()
      const frequencyDays = Number.parseInt(row.getCell(actualHeaders["Frequência (dias)"]).text, 10)

      if (!name || !workStationsString || isNaN(frequencyDays) || frequencyDays <= 0) {
        console.warn(`Linha ${rowNumber} ignorada devido a dados inválidos:`, row.values)
        return // Ignora linhas com dados essenciais faltando ou inválidos
      }

      const workStations = workStationsString
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "")

      // Se a definição da tarefa não existe, adiciona para criação
      if (!taskDefinitionMap.has(name)) {
        taskDefinitionsToCreate.push({ name: name })
        taskDefinitionMap.set(name, "") // Placeholder, será atualizado após a inserção
      }

      // Calcula a próxima data de vencimento a partir de hoje para novas tarefas
      const now = new Date()
      const nextDueDate = addDaysAndAdjustForWeekends(now, frequencyDays) // Updated function call

      importedInstances.push({
        id: crypto.randomUUID(), // ADICIONADO: Gerar UUID para cada instância
        name: name, // Temporariamente armazena o nome para vincular depois
        work_stations: workStations,
        frequency_days: frequencyDays,
        last_executed_at: null, // Tarefas importadas não têm histórico de execução inicial
        next_due_at: nextDueDate.toISOString(),
      } as any) // Usar 'any' temporariamente para o campo 'name' que não existe em TaskInstance
    })

    if (importedInstances.length === 0) {
      return {
        success: false,
        message: "Nenhuma tarefa válida encontrada para importar após a validação dos dados.",
        toastMessage: "Nenhuma tarefa válida encontrada.",
      }
    }

    // Inserir novas definições de tarefa
    if (taskDefinitionsToCreate.length > 0) {
      const { data: newDefinitions, error: insertDefinitionsError } = await supabase
        .from("task_definitions")
        .insert(taskDefinitionsToCreate)
        .select("id, name")

      if (insertDefinitionsError || !newDefinitions) {
        console.error("Erro ao inserir novas definições de tarefa:", insertDefinitionsError)
        return {
          success: false,
          message: "Erro ao salvar definições de tarefa.",
          toastMessage: "Erro ao salvar definições.",
        }
      }
      newDefinitions.forEach((def) => taskDefinitionMap.set(def.name, def.id))
    }

    // Preparar instâncias para inserção com task_definition_id
    const instancesToInsert = importedInstances.map((instance) => {
      const definitionId = taskDefinitionMap.get(instance.name)
      if (!definitionId) {
        throw new Error(`Definição para a tarefa "${instance.name}" não encontrada após a criação.`)
      }
      const { name, ...rest } = instance // Remove o campo 'name'
      return { ...rest, task_definition_id: definitionId }
    })

    // Inserir as instâncias no banco de dados
    const { error: insertInstancesError } = await supabase.from("task_instances").insert(instancesToInsert)

    if (insertInstancesError) {
      console.error("Erro ao inserir instâncias de tarefas importadas:", insertInstancesError)
      return {
        success: false,
        message: "Erro ao salvar instâncias de tarefas no banco de dados.",
        toastMessage: "Erro ao salvar instâncias.",
      }
    }

    revalidatePath("/") // Revalida o cache da página principal para mostrar as novas tarefas
    return {
      success: true,
      message: `Importação concluída! ${importedInstances.length} tarefas adicionadas.`,
      toastMessage: `Importação concluída! ${importedInstances.length} tarefas adicionadas.`,
    }
  } catch (importError) {
    console.error("Erro durante a importação do arquivo XLSX:", importError)
    return {
      success: false,
      message: `Erro ao processar o arquivo: ${importError instanceof Error ? importError.message : String(importError)}. Verifique se o arquivo está no formato correto e se os cabeçalhos correspondem.`,
      toastMessage: "Erro ao processar o arquivo.",
    }
  }
}

export async function exportTaskHistoryToXlsx(
  instanceId: string, // Agora é instanceId
  taskName: string,
): Promise<{ success: boolean; message?: string; xlsxData?: string }> {
  const supabase = createServerClient()

  const { data: history, error } = await supabase
    .from("task_history")
    .select("*")
    .eq("task_id", instanceId)
    .order("executed_at", { ascending: false })

  if (error) {
    console.error("Error fetching task history for XLSX export:", error)
    return { success: false, message: "Erro ao buscar histórico para exportação." }
  }

  if (!history || history.length === 0) {
    return { success: false, message: "Nenhum histórico encontrado para esta tarefa." }
  }

  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(`Histórico - ${taskName}`)

    // Definir cabeçalhos
    worksheet.columns = [
      { header: "ID do Histórico", key: "id", width: 36 },
      { header: "ID da Instância da Tarefa", key: "task_id", width: 36 }, // Alterado o nome da coluna
      { header: "Executado Em", key: "executed_at", width: 20 },
      { header: "Executado Por", key: "executed_by", width: 20 },
      { header: "Observação", key: "observation", width: 50 },
      { header: "Criado Em (Registro)", key: "created_at", width: 20 },
    ]

    // Adicionar linhas de dados
    history.forEach((entry) => {
      worksheet.addRow({
        id: entry.id,
        task_id: entry.task_id,
        executed_at: formatDate(entry.executed_at),
        executed_by: entry.executed_by || "N/A",
        observation: entry.observation || "N/A",
        created_at: formatDate(entry.created_at),
      })
    })

    // Gerar o buffer XLSX
    const buffer = await workbook.xlsx.writeBuffer()
    const base64Data = arrayBufferToBase64(buffer) // Converte para Base64

    return { success: true, message: `Histórico de "${taskName}" exportado com sucesso!`, xlsxData: base64Data }
  } catch (exportError) {
    console.error("Error generating task history XLSX:", exportError)
    return { success: false, message: "Erro ao gerar o arquivo XLSX do histórico." }
  }
}
