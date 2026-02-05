export type TaskStatus = 'backlog' | 'assigned' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type AssignedTo = 'unassigned' | 'sean' | 'zet';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: AssignedTo;
  startDate: string | null;  // ISO date string or null
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export const COLUMNS: { id: TaskStatus; title: string; description: string }[] = [
  { id: 'backlog', title: '📋 Backlog', description: 'Unassigned tasks' },
  { id: 'assigned', title: '👤 Assigned', description: 'Waiting for start date' },
  { id: 'in-progress', title: '🔄 In Progress', description: 'Currently working' },
  { id: 'review', title: '👀 Review', description: 'Awaiting review' },
  { id: 'done', title: '✅ Done', description: 'Completed & reviewed' },
];
