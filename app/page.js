"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"

export default function Home() {
  // Passe as variáveis de ambiente explicitamente para o cliente Supabase
  // Isso garante que ele as encontre, mesmo que a detecção automática falhe por algum motivo.
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  const [task_definitions, setTaskDefinitions] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("task_definitions").select("*")
      console.log("Dados de task_definitions recebidos para exibição:", data)
      if (error) {
        console.error("Erro ao buscar task_definitions para exibição:", error)
      }
      setTaskDefinitions(data)
    }

    fetchData()
  }, [supabase])

  return (
    <div>
      <h1>Task Definitions</h1>
      {task_definitions && Array.isArray(task_definitions) && task_definitions.length > 0 ? (
        task_definitions.map((task, index) => {
          console.log(`Renderizando item ${index}:`, task)
          if (!task || typeof task.name === "undefined") {
            console.warn(`Item ${index} é nulo/indefinido ou não tem 'name' para exibição:`, task)
            return null
          }
          return <div key={task.id}>{task.name}</div>
        })
      ) : (
        <div>Nenhuma definição de tarefa encontrada ou dados inválidos.</div>
      )}
    </div>
  )
}
