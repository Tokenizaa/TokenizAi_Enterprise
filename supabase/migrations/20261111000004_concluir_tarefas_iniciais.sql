-- Atualizar tarefas para concluido
UPDATE issues SET status = 'concluido', updated_at = NOW()
WHERE status = 'backlog'
RETURNING id, title, status, updated_at;
