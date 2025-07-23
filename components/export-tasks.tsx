"use client"

// Update the import path below if your Button component is located elsewhere
import { Button } from "../components/ui/button"
import { Download } from "lucide-react"

export function ExportTasks() {
  const handleExport = () => {
    // Implementar lógica de exportação
    console.log("Exportando tarefas...")
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Exportar
    </Button>
  )
}
