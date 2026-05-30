export interface User {
  username: string;
  email: string;
  joinDate: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  expiration: string;
  username: string;
  email: string;
  joinDate: string;
  roles: string[];
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: 'Pending' | 'InProgress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  category?: string;
  dueDate?: string;
  userId?: string;
  createdAt?: string;
  isAssignedByAdmin?: boolean;
  user?: {
    userName: string;
    email: string;
  };
}

export interface DashboardStats {
  completed: number;
  pending: number;
  inProgress: number;
  total: number;
  dueToday: number;
  upcoming: number;
  overdue: number;
}
