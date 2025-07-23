-- Script consolidado para configurar banco de desenvolvimento
-- Execute este script no SQL Editor do novo projeto Supabase

-- Limpar tabelas existentes (se necessário)
DROP TABLE IF EXISTS task_history CASCADE;
DROP TABLE IF EXISTS task_instances CASCADE;
DROP TABLE IF EXISTS task_definitions CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- 1. Criar tabela de definições de tarefas
CREATE TABLE task_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de instâncias de tarefas
CREATE TABLE task_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_definition_id UUID NOT NULL REFERENCES task_definitions(id) ON DELETE CASCADE,
    work_stations TEXT[] NOT NULL,
    frequency_days INTEGER NOT NULL,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    next_due_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de histórico de execução
CREATE TABLE task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES task_instances(id) ON DELETE CASCADE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_by TEXT DEFAULT 'Usuário Padrão',
    observation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de projetos (se necessário)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Inserir dados de exemplo para desenvolvimento
INSERT INTO task_definitions (name, description) VALUES
('Bico de ar', 'Manutenção dos bicos de ar comprimido'),
('Verificação de Nível de Óleo', 'Verificação e reposição de óleo dos compressores'),
('Calibração de Sensor', 'Calibração dos sensores das linhas de montagem'),
('Inspeção de Correias', 'Inspeção e substituição de correias transportadoras');

-- 6. Inserir instâncias de exemplo
INSERT INTO task_instances (task_definition_id, work_stations, frequency_days, last_executed_at, next_due_at)
SELECT 
    td.id,
    CASE 
        WHEN td.name = 'Bico de ar' THEN ARRAY['ndc', 'carregadora de vidro frontal', 'stringer', 'aparadora de encapsulante traseiro']
        WHEN td.name = 'Verificação de Nível de Óleo' THEN ARRAY['compressor 1', 'compressor 2']
        WHEN td.name = 'Calibração de Sensor' THEN ARRAY['linha de montagem A', 'linha de montagem B']
        WHEN td.name = 'Inspeção de Correias' THEN ARRAY['transportador principal']
    END as work_stations,
    CASE 
        WHEN td.name = 'Bico de ar' THEN 30
        WHEN td.name = 'Verificação de Nível de Óleo' THEN 90
        WHEN td.name = 'Calibração de Sensor' THEN 180
        WHEN td.name = 'Inspeção de Correias' THEN 60
    END as frequency_days,
    NOW() - INTERVAL '15 days' as last_executed_at,
    NOW() + INTERVAL '15 days' as next_due_at
FROM task_definitions td;
