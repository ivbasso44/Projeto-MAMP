"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { CreateTaskDialogTest } from "./create-task-dialog-test"
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

export function TaskTableStep3() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleTaskCreated = (newTask: any) => {
    console.log("✅ Tarefa criada:", newTask)
    alert("✅ Tarefa criada com sucesso!")
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">TaskTable Step 3 - Testando CreateTaskDialog + AlertDialog</h2>
      
      {/* Teste de componentes mais complexos */}
      <div className="bg-orange-100 p-4 rounded mb-4">
        <h3 className="font-bold mb-2">🚀 TESTANDO COMPONENTES REAIS:</h3>
        
        {/* Input de busca */}
        <div className="mb-3">
          <Input 
            placeholder="Buscar tarefas..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
          />
        </div>
        
        {/* Botões principais */}
        <div className="flex gap-2 flex-wrap mb-2">
          <Button 
            onClick={() => {
              console.log("✅ Abrindo CreateTaskDialog!")
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
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                Excluir Todas
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente todas as suas tarefas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    console.log("✅ AlertDialog funcionou!")
                    alert("✅ AlertDialog OK - Excluir Todas!")
                  }}
                >
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <p className="text-sm text-gray-600">
          CreateDialog aberto: {isCreateDialogOpen ? "✅ Sim" : "❌ Não"}
        </p>
        <p className="text-sm text-gray-600">
          Termo de busca: "{searchTerm}"
        </p>
      </div>

      {/* CreateTaskDialog TESTE */}
      <CreateTaskDialogTest 
        isOpen={isCreateDialogOpen}
        onClose={() => {
          console.log("✅ Fechando CreateTaskDialogTest")
          setIsCreateDialogOpen(false)
        }}
        onTaskCreated={handleTaskCreated}
      />

      {/* Área da tabela simples */}
      <div className="border rounded p-4">
        <h3 className="font-bold mb-2">Área da Tabela</h3>
        <p className="text-gray-500">Tabela simples funcionando...</p>
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
          <p>Status dos testes:</p>
          <ul className="list-disc list-inside mt-1">
            <li>✅ Botões básicos</li>
            <li>✅ Input e Dialog simples</li>
            <li>🧪 CreateTaskDialog real</li>
            <li>🧪 AlertDialog</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
