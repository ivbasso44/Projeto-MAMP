// Este é um exemplo de como sua função de parsing XLSX pode ser.
// Adapte os nomes das colunas e a lógica de acordo com seu código real.

import * as XLSX from "xlsx" // Certifique-se de que você tem esta biblioteca instalada

export async function parseTaskXLSX(file) {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  // sheet_to_json com { header: 1 } retorna um array de arrays (linhas e colunas)
  // sheet_to_json sem { header: 1 } tenta inferir cabeçalhos e retorna um array de objetos
  // Vamos usar a abordagem de array de arrays para maior controle e pular a primeira linha (cabeçalho)
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

  // O log indica que a linha 88 está sendo ignorada.
  // Se a primeira linha é o cabeçalho, a linha 88 do XLSX é o índice 87 no array `rawRows`.
  // Se a primeira linha de dados é o índice 0, a linha 88 do XLSX é o índice 87.

  const tasksToInsert = []

  // Começa do índice 1 para pular a linha do cabeçalho (Nome da Tarefa, Postos de Trabalho, Frequência (dias))
  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i]

    // Log para depuração da linha 88 (ou qualquer linha que esteja dando problema)
    if (i === 87) {
      // Linha 88 do XLSX (índice 87 no array 0-based)
      console.log(`DEBUG: Processando linha ${i + 1} do XLSX:`, row)
    }

    // Verifique se a linha tem dados suficientes para ser uma tarefa válida
    // Assumindo que 'Nome da Tarefa' (coluna A, índice 0) é essencial
    const taskName = row[0]
    if (!taskName || String(taskName).trim() === "") {
      console.warn(`Linha ${i + 1} ignorada: 'Nome da Tarefa' está vazio ou inválido.`, row)
      continue // Pula para a próxima linha se o nome da tarefa for inválido
    }

    // Mapeie as colunas para os campos do seu banco de dados
    // Use o operador OR (||) para fornecer um valor padrão (string vazia ou null) se a célula estiver vazia
    const workStations = row[1] ? String(row[1]).trim() : "" // Coluna B
    const description = row[2] ? String(row[2]).trim() : "" // Coluna C
    const frequencyDays = row[3] ? Number.parseInt(row[3], 10) : null // Coluna D, converte para número, ou null se vazio/inválido

    // Validação adicional para frequência, se for um campo obrigatório e numérico
    if (frequencyDays === null || isNaN(frequencyDays)) {
      console.warn(`Linha ${i + 1} ignorada: 'Frequência (dias)' está vazio ou não é um número válido.`, row)
      continue // Pula se a frequência for inválida
    }

    tasksToInsert.push({
      name: taskName,
      work_stations: workStations,
      description: description, // Se você tiver uma coluna para a coluna C
      frequency_days: frequencyDays,
      // ... adicione outras colunas conforme necessário
    })
  }

  console.log("Tarefas prontas para inserção após parsing:", tasksToInsert)
  return tasksToInsert
}
