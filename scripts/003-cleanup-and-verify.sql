-- Este script verifica o esquema após a migração e realiza a limpeza.

-- Re-habilita session_replication_role caso tenha sido desabilitado
SET session_replication_role = origin;

-- Verifica e garante que a tabela task_definitions exista
CREATE TABLE IF NOT EXISTS task_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verifica e garante que a tabela task_instances exista
CREATE TABLE IF NOT EXISTS task_instances (
    id UUID PRIMARY KEY,
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

-- Verifica e garante que a tabela task_history exista
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

-- Opcional: Limpa old_tasks_backup se existir
-- Esta tabela só deve existir se a migração anterior foi executada com sucesso.
DROP TABLE IF EXISTS old_tasks_backup;

-- Mensagem informativa (opcional, para o console do usuário)
SELECT 'Verificação e limpeza do esquema concluídas.' AS status;
