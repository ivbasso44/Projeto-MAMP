"use client"

import { useState } from "react"

export function DashboardSimple() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard Simplificado</h2>
      
      {/* Teste básico de funcionalidade */}
      <div className="bg-green-100 p-4 rounded mb-4">
        <h3 className="font-bold mb-2">🔧 TESTE DE DASHBOARD:</h3>
        <p className="mb-2">Contador: {count}</p>
        <button 
          onClick={() => {
            console.log("✅ Botão dashboard funcionou!")
            setCount(count + 1)
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          Incrementar {count}
        </button>
        
        <button 
          onClick={() => {
            console.log("✅ Reset dashboard!")
            setCount(0)
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg">Total de Tarefas</h3>
          <p className="text-2xl text-blue-600">0</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg">Em Andamento</h3>
          <p className="text-2xl text-yellow-600">0</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg">Concluídas</h3>
          <p className="text-2xl text-green-600">0</p>
        </div>
      </div>
    </div>
  )
}
