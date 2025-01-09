// ... (manter tipos existentes)

export interface TaskList {
  id: string;
  name: string;
  order: number;
  created_at: string;
  user_id: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  list_id: string;
  order: number;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  user_id: string;
}