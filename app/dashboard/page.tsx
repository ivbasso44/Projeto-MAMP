import { getDashboardSummary } from "@/actions/dashboard"
import { DashboardOverview } from "@/components/dashboard-overview"

export const dynamic = "force-dynamic" // Garante que os dados sejam sempre frescos

export default async function DashboardPage() {
  const initialSummary = await getDashboardSummary()

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-950 py-8 px-4">
      <div className="w-full max-w-screen-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Dashboard de Visão Geral</h1>
        
        {/* Botão de teste */}
        <button 
          onClick={() => {
            console.log("TESTE: Botão HTML puro clicado!")
            alert("Botão HTML puro funcionou!")
          }}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            margin: '10px',
            cursor: 'pointer'
          }}
        >
          TESTE: Botão HTML Puro
        </button>
        
        <DashboardOverview initialSummary={initialSummary} />
      </div>
    </div>
  )
}
