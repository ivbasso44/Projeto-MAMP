export interface TaskHistory {
  id: string
  task_id: string
  user_id: string
  action_type: 'created' | 'updated' | 'deleted' | 'completed'
  changes: Record<string, any>
  created_at: string
  executed_at?: string
  executed_by?: string
  observation?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface TaskDefinition {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface TaskInstance {
  id: string
  task_definition_id: string
  user_id: string
  status: 'pending' | 'in_progress' | 'completed'
  start_date?: string
  end_date?: string
  work_stations: string[]
  frequency_days: number
  last_executed_at?: string
  next_due_at?: string
  created_at: string
  updated_at: string
}

export interface TaskWithDefinition extends TaskInstance {
  project_id: undefined
  name: string
  description?: string
}

export interface AggregatedTaskDisplay {
  id: string
  task_definition_id: string
  name: string
  description?: string
  work_stations: string[]
  frequency_days: number
  last_executed_at?: string
  next_due_at?: string
  instances: TaskInstance[]
  originalInstances: TaskWithDefinition[]
  // Campos adicionais necessários para TaskTable
  status: string
  title: string
  created_at?: Date
  updated_at?: Date
  project_id?: string
  project_name: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>
      }
      task_history: {
        Row: TaskHistory
        Insert: Omit<TaskHistory, 'id' | 'created_at'>
        Update: Partial<Omit<TaskHistory, 'id' | 'created_at'>>
      }
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
