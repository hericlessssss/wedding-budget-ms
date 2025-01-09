export interface BudgetCategory {
  id: string;
  name: string;
  agreed_amount: number;
  spent_amount: number;
  payment_status: 'pending' | 'partial' | 'paid';
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Supplier {
  id: string;
  name: string;
  service: string;
  price: number;
  status: 'potential' | 'final';
  payment_status: 'pending' | 'partial' | 'paid';
  comments?: string;
  portfolio_link?: string;
  instagram?: string;
  contract_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  created_at: string;
  user_id: string;
}

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
  task_lists?: {
    name: string;
  };
}