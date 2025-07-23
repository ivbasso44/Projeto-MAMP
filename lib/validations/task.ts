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

export type Task = z.infer<typeof taskSchema>
