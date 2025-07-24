"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"

export function TaskTableStep2() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">TaskTable Step 2 - Testando Dialog e Input</h2>
      
      {/* Teste de componentes mais complexos */}
      <div className="bg-purple-100 p-4 rounded mb-4">
        <h3 className="font-bold mb-2">🧪 TESTANDO COMPONENTES COMPLEXOS:</h3>
        
        {/* Input de busca */}
        <div className="mb-3">
          <Input 
            placeholder="Buscar tarefas..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
          />
          <p className="text-sm mt-1">Termo de busca: "{searchTerm}"</p>
        </div>
        
        {/* Botões */}
        <div className="flex gap-2 flex-wrap mb-2">
          <Button 
            onClick={() => {
              console.log("✅ Abrindo Dialog!")
              setIsCreateDialogOpen(true)
            }}
          >
            Abrir Dialog
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => console.log("✅ Botão outline funcionou!")}
          >
            Botão Outline
          </Button>
        </div>
        
        <p className="text-sm text-gray-600">
          Dialog aberto: {isCreateDialogOpen ? "✅ Sim" : "❌ Não"}
        </p>
      </div>

      {/* Dialog de teste */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teste de Dialog</DialogTitle>
            <DialogDescription>
              Este é um teste do componente Dialog para ver se está funcionando corretamente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>✅ Dialog está funcionando!</p>
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => {
                  console.log("✅ Botão dentro do dialog funcionou!")
                  setIsCreateDialogOpen(false)
                }}
              >
                Fechar
              </Button>
              <Button 
                variant="outline"
                onClick={() => console.log("✅ Segundo botão do dialog!")}
              >
                Teste
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Área da tabela simples */}
      <div className="border rounded p-4">
        <h3 className="font-bold mb-2">Área da Tabela</h3>
        <p className="text-gray-500">Sem dados ainda...</p>
      </div>
    </div>
  )
}
