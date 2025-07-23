"use client"

// Update the import path below if your Button component is located elsewhere
import { Button } from "../components/ui/button"
import { Upload } from "lucide-react"

export function ImportTasks() {
  const handleImport = () => {
    // Implementar lógica de importação
    console.log("Importando tarefas...")
  }

  return (
    <Button onClick={handleImport} variant="outline" size="sm">
      <Upload className="mr-2 h-4 w-4" />
      Importar
    </Button>
  )
}
