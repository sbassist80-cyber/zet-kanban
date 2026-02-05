export type TaskStatus = 'suggested' | 'approved' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type AssignedTo = 'sean' | 'zet';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: AssignedTo;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'suggested', title: '📝 Suggested' },
  { id: 'approved', title: '✅ Approved' },
  { id: 'in-progress', title: '🔄 In Progress' },
  { id: 'done', title: '✔️ Done' },
];
