-- Desabilitar verificações de chave estrangeira temporariamente para facilitar a migração
SET session_replication_role = replica;

-- 1. Criar a nova tabela task_definitions
CREATE TABLE IF NOT EXISTS task_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- Nome da tarefa, agora único
    description TEXT, -- Adicionar uma descrição opcional para o tipo de tarefa
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar a nova tabela task_instances
CREATE TABLE IF NOT EXISTS task_instances (
    id UUID PRIMARY KEY, -- Manter o ID original da tabela 'tasks' para compatibilidade com 'task_history'
    task_definition_id UUID NOT NULL REFERENCES task_definitions(id) ON DELETE CASCADE,
    work_stations TEXT[] NOT NULL,
    frequency_days INTEGER NOT NULL,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    next_due_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Migrar dados da tabela 'tasks' para 'task_definitions'
-- Inserir apenas nomes de tarefas únicos na nova tabela de definições
-- CORREÇÃO: Usando 'tasks' em vez de 'old_tasks_backup'
INSERT INTO task_definitions (name, created_at)
SELECT name, MIN(created_at) -- Pega a data de criação mais antiga para o nome
FROM tasks -- <-- CORRIGIDO AQUI
GROUP BY name
ON CONFLICT (name) DO NOTHING; -- Evita erros se já houver dados (para re-execuções)

-- 4. Migrar dados da tabela 'tasks' para 'task_instances'
-- E vincular com as task_definitions recém-criadas
INSERT INTO task_instances (id, task_definition_id, work_stations, frequency_days, last_executed_at, next_due_at, created_at)
SELECT
    t.id,
    td.id AS task_definition_id,
    t.work_stations,
    t.frequency_days,
    t.last_executed_at,
    t.next_due_at,
    t.created_at
FROM
    tasks AS t -- <-- CORRIGIDO AQUI
JOIN
    task_definitions AS td ON t.name = td.name
ON CONFLICT (id) DO NOTHING; -- Evita erros se já houver dados (para re-execuções)

-- 5. Atualizar a chave estrangeira em task_history para referenciar task_instances
-- Primeiro, remover a chave estrangeira antiga se existir
ALTER TABLE task_history DROP CONSTRAINT IF EXISTS task_history_task_id_fkey;

-- Adicionar a nova chave estrangeira referenciando task_instances
ALTER TABLE task_history
ADD CONSTRAINT task_history_task_id_fkey
FOREIGN KEY (task_id) REFERENCES task_instances(id) ON DELETE CASCADE;

-- 6. Renomear a tabela 'tasks' antiga para um backup
-- Esta linha agora deve funcionar, pois a tabela 'tasks' existe.
ALTER TABLE tasks RENAME TO old_tasks_backup;

-- Se você tiver certeza e quiser excluir a tabela antiga imediatamente, descomente a linha abaixo:
-- DROP TABLE IF EXISTS old_tasks_backup;

-- Reabilitar verificações de chave estrangeira
SET session_replication_role = origin;
