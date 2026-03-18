export type Theme = 'glass' | 'natural' | 'paper' | 'nebula' | 'cyberpunk';
export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'health' | 'learning' | 'other';

export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  duration: number; // in hours
  date?: string; // YYYY-MM-DD
  time?: number; // 0-23
  priority: Priority;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
  category?: Category;
  subtasks?: SubTask[];
  timeSpent?: number; // in seconds
  timerRunning?: boolean;
  timerStartTime?: number; // timestamp
  completedAt?: string; // ISO string
};
