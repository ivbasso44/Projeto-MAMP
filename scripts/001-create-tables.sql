-- Tabela para armazenar as tarefas de manutenção
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    work_stations TEXT[] NOT NULL, -- Array de strings para os postos de trabalho
    frequency_days INTEGER NOT NULL,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    next_due_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar o histórico de execução das tarefas
CREATE TABLE IF NOT EXISTS task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observation TEXT,
    executed_by TEXT DEFAULT 'Usuário Padrão',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir algumas tarefas de exemplo (opcional, para testar)
INSERT INTO tasks (name, work_stations, frequency_days, last_executed_at, next_due_at) VALUES
('Bico de ar', ARRAY['ndc', 'carregadora de vidro frontal', 'stringer', 'aparadora de encapsulante traseiro'], 30, '2024-07-01 10:00:00+00', '2024-08-12 10:00:00+00'),
('Verificação de Nível de Óleo', ARRAY['compressor 1', 'compressor 2'], 90, '2024-06-15 09:00:00+00', '2024-09-13 09:00:00+00'),
('Calibração de Sensor', ARRAY['linha de montagem A', 'linha de montagem B'], 180, '2024-01-20 14:00:00+00', '2024-07-18 14:00:00+00'),
('Inspeção de Correias', ARRAY['transportador principal'], 60, '2024-05-01 11:00:00+00', '2024-07-30 11:00:00+00');
