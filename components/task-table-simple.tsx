"use client"

import { useState } from "react"

export function TaskTableSimple() {
  const [test, setTest] = useState(false)

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tabela de Tarefas - Versão Simplificada</h2>
      
      {/* Teste básico de botão */}
      <div className="bg-blue-100 p-4 rounded mb-4">
        <h3 className="font-bold mb-2">🔧 TESTE SIMPLES:</h3>
        <button 
          onClick={() => {
            console.log("✅ Botão básico funcionou!")
            alert("✅ Botão OK!")
            setTest(!test)
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          Teste Básico {test ? "✅" : "❌"}
        </button>
        
        <button 
          onClick={() => {
            console.log("✅ Segundo botão funcionou!")
            window.location.reload()
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Recarregar Página
        </button>
      </div>

      <div className="border rounded p-4">
        <p>Esta é uma versão simplificada para testar funcionalidade básica.</p>
        <p>Estado do teste: {test ? "Ativo" : "Inativo"}</p>
      </div>
    </div>
  )
}
