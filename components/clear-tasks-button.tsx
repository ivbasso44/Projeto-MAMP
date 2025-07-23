// components/clear-tasks-button.tsx
"use client"

import { Button } from "@/components/ui/button" // Importe o componente Button do shadcn/ui
import { useActionState } from "react"
import { clearAllTasks } from "@/actions/clear-tasks" // Importe sua Server Action

export function ClearTasksButton() {
  // useActionState para gerenciar o estado da ação (pendente, sucesso, erro)
  const [state, formAction, isPending] = useActionState(clearAllTasks, null)

  // Opcional: Exibir mensagens de sucesso/erro
  // Você pode usar um toast ou um div simples para isso
  if (state?.success) {
    console.log("Sucesso:", state.message)
    // Adicione lógica para recarregar a página ou os dados após a exclusão
    // window.location.reload(); // Recarrega a página para mostrar os dados atualizados
  }
  if (state?.success === false) {
    console.error("Erro:", state.message)
  }

  return (
    <form action={formAction}>
      <Button
        type="submit"
        variant="destructive" // Estilo de botão para ações destrutivas
        disabled={isPending} // Desabilita o botão enquanto a ação está pendente
      >
        {isPending ? "Limpando..." : "Limpar Todas as Tarefas"}
      </Button>
      {state?.message && <p className={state.success ? "text-green-500" : "text-red-500"}>{state.message}</p>}
    </form>
  )
}
