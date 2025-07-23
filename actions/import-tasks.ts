// actions/import-tasks.ts
"use server"

import { parseTaskXLSX } from "@/lib/xlsx-parser"
import { createClient } from "@supabase/supabase-js"

export async function importTasks(formData: FormData) {
  const file = formData.get("file") as File

  if (!file) {
    return { success: false, message: "Nenhum arquivo enviado." }
  }

  try {
    const tasks = await parseTaskXLSX(file)
    console.log("Tarefas parsed para inserção/upsert:", tasks)

    if (tasks.length === 0) {
      return { success: false, message: "Nenhuma tarefa válida encontrada no arquivo XLSX." }
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // --- Lógica de UPSERT ---
    // O método upsert tenta atualizar uma linha se ela já existe (baseado na chave primária ou em colunas únicas)
    // e insere uma nova linha se não existir.
    // Você precisa garantir que sua tabela 'task_definitions' tenha uma chave primária
    // ou uma restrição UNIQUE em uma coluna que identifique a tarefa de forma única (ex: 'name').
    // Se 'name' for único, você pode especificar 'onConflict: "name"'.
    // Se 'id' for a chave primária, o upsert usará 'id' por padrão.

    const { data, error } = await supabase
      .from("task_definitions")
      .upsert(tasks, {
        onConflict: "name", // <--- MUITO IMPORTANTE: Substitua 'name' pela coluna que identifica sua tarefa de forma única
        ignoreDuplicates: false, // Garante que o upsert tente atualizar ou inserir
      })
      .select() // Para retornar os dados inseridos/atualizados

    if (error) {
      console.error("Erro ao inserir/atualizar tarefas no Supabase:", error)
      return { success: false, message: `Erro ao salvar definições de tarefa: ${error.message}` }
    }

    console.log("Tarefas inseridas/atualizadas com sucesso:", data)
    return { success: true, message: "Tarefas importadas/atualizadas com sucesso!" }
  } catch (error: any) {
    console.error("Erro durante o processo de importação:", error)
    return { success: false, message: `Erro no processamento do arquivo: ${error.message}` }
  }
}
