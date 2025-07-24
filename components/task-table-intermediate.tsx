"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"

export function TaskTableIntermediate() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [tasks, setTasks] = useState<any[]>([])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tabela de Tarefas - Versão Intermediária</h2>
      
      {/* Teste de funcionalidade básica */}
      <div className="bg-blue-100 p-4 rounded mb-4">
        <h3 className="font-bold mb-2">✅ FUNCIONALIDADES TESTADAS:</h3>
        <div className="flex gap-2 flex-wrap mb-2">
          <Button 
            onClick={() => {
              console.log("✅ Botão Criar Nova Tarefa funcionou!")
              setIsCreateDialogOpen(true)
            }}
          >
            Criar Nova Tarefa
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              console.log("✅ Botão Importar funcionou!")
              alert("Importar funcionou!")
            }}
          >
            Importar
          </Button>
          
          <Button 
            variant="secondary"
            disabled
          >
            Exportar (em desenvolvimento)
          </Button>
          
          <Button 
            variant="destructive"
            onClick={() => {
              console.log("✅ Botão Excluir Todas funcionou!")
              alert("Excluir Todas funcionou!")
            }}
          >
            Excluir Todas
          </Button>
        </div>
        
        <p className="text-sm text-gray-600">
          Dialog aberto: {isCreateDialogOpen ? "✅ Sim" : "❌ Não"}
        </p>
        
        {isCreateDialogOpen && (
          <div className="mt-2 p-2 bg-green-100 rounded">
            <p className="font-bold">✅ Modal funcionando!</p>
            <Button 
              size="sm" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Fechar Modal
            </Button>
          </div>
        )}
      </div>

      {/* Área da tabela */}
      <div className="border rounded p-4">
        <h3 className="font-bold mb-2">Lista de Tarefas</h3>
        {tasks.length === 0 ? (
          <p className="text-gray-500">Nenhuma tarefa encontrada.</p>
        ) : (
          <div>
            {tasks.map((task, index) => (
              <div key={index} className="p-2 border-b">
                {task.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
