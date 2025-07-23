import { z } from "zod"

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(2, { message: "Título deve ter pelo menos 2 caracteres." }),
  description: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres." }),
  next_due_at: z.date().nullable(),
  status: z.string(),
  project_id: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
})

export const createTaskSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  workStations: z.array(z.string()).min(1, { message: "Selecione pelo menos um posto de trabalho." }),
  frequencyDays: z.number().min(1, { message: "Frequência deve ser pelo menos 1 dia." }),
})

export type Task = z.infer<typeof taskSchema>
export type CreateTaskFormData = z.infer<typeof createTaskSchema>
