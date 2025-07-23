-- Script alternativo para banco de desenvolvimento
-- Use este se o primeiro apresentar problemas

-- Verificar e criar task_definitions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_definitions') THEN
        CREATE TABLE task_definitions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Verificar e criar task_instances
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_instances') THEN
        CREATE TABLE task_instances (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            task_definition_id UUID NOT NULL REFERENCES task_definitions(id) ON DELETE CASCADE,
            work_stations TEXT[] NOT NULL,
            frequency_days INTEGER NOT NULL,
            last_executed_at TIMESTAMP WITH TIME ZONE,
            next_due_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Verificar e criar task_history
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_history') THEN
        CREATE TABLE task_history (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            task_id UUID REFERENCES task_instances(id) ON DELETE CASCADE,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            executed_by TEXT DEFAULT 'Usuário Padrão',
            observation TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Verificar e criar projects
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        CREATE TABLE projects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Inserir dados de exemplo apenas se não existirem
INSERT INTO task_definitions (name, description) 
SELECT 'Bico de ar', 'Manutenção dos bicos de ar comprimido'
WHERE NOT EXISTS (SELECT 1 FROM task_definitions WHERE name = 'Bico de ar');

INSERT INTO task_definitions (name, description) 
SELECT 'Verificação de Nível de Óleo', 'Verificação e reposição de óleo dos compressores'
WHERE NOT EXISTS (SELECT 1 FROM task_definitions WHERE name = 'Verificação de Nível de Óleo');

INSERT INTO task_definitions (name, description) 
SELECT 'Calibração de Sensor', 'Calibração dos sensores das linhas de montagem'
WHERE NOT EXISTS (SELECT 1 FROM task_definitions WHERE name = 'Calibração de Sensor');

INSERT INTO task_definitions (name, description) 
SELECT 'Inspeção de Correias', 'Inspeção e substituição de correias transportadoras'
WHERE NOT EXISTS (SELECT 1 FROM task_definitions WHERE name = 'Inspeção de Correias');

-- Inserir instâncias de exemplo
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
FROM task_definitions td
WHERE NOT EXISTS (
    SELECT 1 FROM task_instances ti WHERE ti.task_definition_id = td.id
);
