-- Desabilitar verificações de chave estrangeira temporariamente para facilitar a limpeza
SET session_replication_role = replica;

-- 1. Limpar dados das tabelas principais (TRUNCATE para remover todos os registros e reiniciar sequências)
TRUNCATE TABLE task_history RESTART IDENTITY CASCADE;
TRUNCATE TABLE task_instances RESTART IDENTITY CASCADE;
TRUNCATE TABLE task_definitions RESTART IDENTITY CASCADE;

-- 2. Remover a tabela de backup antiga, se existir
DROP TABLE IF EXISTS old_tasks_backup;

-- 3. Re-criar as tabelas e chaves estrangeiras (como um safeguard, caso tenham sido removidas)
-- Garante que a tabela task_definitions exista
CREATE TABLE IF NOT EXISTS task_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garante que a tabela task_instances exista
CREATE TABLE IF NOT EXISTS task_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- ADICIONADO: DEFAULT gen_random_uuid()
    task_definition_id UUID NOT NULL,
    work_stations TEXT[] NOT NULL,
    frequency_days INTEGER NOT NULL,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    next_due_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona ou re-adiciona a chave estrangeira para task_instances para task_definitions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_instances_task_definition_id_fkey') THEN
        ALTER TABLE task_instances
        ADD CONSTRAINT task_instances_task_definition_id_fkey
        FOREIGN KEY (task_definition_id) REFERENCES task_definitions(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Garante que a tabela task_history exista
CREATE TABLE IF NOT EXISTS task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observation TEXT,
    executed_by TEXT DEFAULT 'Usuário Padrão',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona ou re-adiciona a chave estrangeira para task_history para task_instances
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_history_task_id_fkey') THEN
        ALTER TABLE task_history
        ADD CONSTRAINT task_history_task_id_fkey
        FOREIGN KEY (task_id) REFERENCES task_instances(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Reabilitar verificações de chave estrangeira
SET session_replication_role = origin;

-- Mensagem informativa
SELECT 'Limpeza e redefinição do esquema concluídas. O banco de dados está pronto para novas importações.' AS status;
