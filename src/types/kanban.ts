export type TaskStatus = 'backlog' | 'assigned' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type AssignedTo = 'unassigned' | 'sean' | 'zet';

export interface BusinessUnit {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_BUSINESS_UNITS: BusinessUnit[] = [
  { id: 'ignitioncx', name: 'IgnitionCX', color: '#3B82F6' },
  { id: 'ignition-group', name: 'Ignition Group', color: '#8B5CF6' },
  { id: 'mvnx', name: 'MVNX', color: '#10B981' },
  { id: 'spot', name: 'Spot', color: '#F59E0B' },
  { id: 'fundamentum', name: 'Fundamentum', color: '#EF4444' },
  { id: 'gumtree', name: 'Gumtree SA', color: '#78716C' },
  { id: 'residential-property', name: 'Residential Property', color: '#EC4899' },
  { id: 'hospitality', name: 'Hospitality', color: '#06B6D4' },
];

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: AssignedTo;
  businessUnit?: string;  // Business unit ID
  startDate: string | null;  // ISO date string or null
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface Activity {
  id: string;
  timestamp: string;
  actor: 'zet' | 'sean' | 'system';
  action: string;
  details?: string;
  relatedTaskId?: string;
  category: 'task' | 'meeting' | 'research' | 'email' | 'dashboard' | 'system' | 'other';
}

export const COLUMNS: { id: TaskStatus; title: string; description: string }[] = [
  { id: 'backlog', title: '📋 Backlog', description: 'Unassigned tasks' },
  { id: 'assigned', title: '👤 Assigned', description: 'Waiting for start date' },
  { id: 'in-progress', title: '🔄 In Progress', description: 'Currently working' },
  { id: 'review', title: '👀 Review', description: 'Awaiting review' },
  { id: 'done', title: '✅ Done', description: 'Completed & reviewed' },
];
