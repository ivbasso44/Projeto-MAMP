// actions/clear-tasks.ts
"use server"

import { createClient } from "@supabase/supabase-js"

export async function clearAllTasks() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  try {
    // 1. Excluir todas as instâncias de tarefas primeiro (se houver foreign keys, a ordem importa)
    const { error: instancesError } = await supabase.from("task_instances").delete().neq("id", "0") // .neq("id", "0") é um truque para deletar tudo sem WHERE, mas pode ser omitido se não houver outras condições

    if (instancesError) {
      console.error("Erro ao excluir instâncias de tarefas:", instancesError)
      return { success: false, message: `Erro ao excluir instâncias: ${instancesError.message}` }
    }
    console.log("Todas as instâncias de tarefas excluídas com sucesso.")

    // 2. Excluir todas as definições de tarefas
    const { error: definitionsError } = await supabase.from("task_definitions").delete().neq("id", "0")

    if (definitionsError) {
      console.error("Erro ao excluir definições de tarefas:", definitionsError)
      return { success: false, message: `Erro ao excluir definições: ${definitionsError.message}` }
    }
    console.log("Todas as definições de tarefas excluídas com sucesso.")

    return { success: true, message: "Todas as tarefas foram limpas com sucesso!" }
  } catch (error: any) {
    console.error("Erro inesperado ao limpar tarefas:", error)
    return { success: false, message: `Erro inesperado: ${error.message}` }
  }
}
