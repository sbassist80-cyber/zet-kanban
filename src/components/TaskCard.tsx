'use client';

import { Task, AssignedTo, BusinessUnit } from '@/types/kanban';

interface TaskCardProps {
  task: Task;
  onDelete: () => void;
  onClick: () => void;
  onAssign?: (assignee: AssignedTo) => void;
  isDragging: boolean;
  businessUnits?: BusinessUnit[];
}

const priorityColors = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-red-500',
};

const assigneeDisplay: Record<string, { emoji: string; label: string }> = {
  unassigned: { emoji: '❓', label: 'Unassigned' },
  sean: { emoji: '👤', label: 'Sean' },
  zet: { emoji: '🐙', label: 'Zet' },
};

const getAssigneeInfo = (assignedTo: string | null | undefined) => {
  if (!assignedTo || !assigneeDisplay[assignedTo]) {
    return assigneeDisplay['unassigned'];
  }
  return assigneeDisplay[assignedTo];
};

export default function TaskCard({ task, onDelete, onClick, onAssign, isDragging, businessUnits = [] }: TaskCardProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-ZA', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const isOverdue = task.startDate && new Date(task.startDate) < new Date() && 
    task.status !== 'done' && task.status !== 'review';

  // Show quick-assign only for backlog tasks
  const showQuickAssign = task.status === 'backlog' && task.assignedTo === 'unassigned' && onAssign;

  // Get business unit info
  const businessUnit = task.businessUnit 
    ? businessUnits.find(u => u.id === task.businessUnit)
    : null;

  return (
    <div
      onClick={onClick}
      className={`bg-gray-700 rounded-lg p-3 border-l-4 ${priorityColors[task.priority]} ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      } cursor-pointer hover:bg-gray-650 transition`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-medium text-sm pr-2">{task.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-red-400 text-xs flex-shrink-0"
        >
          ✕
        </button>
      </div>
      
      {/* Business Unit Badge */}
      {businessUnit && (
        <div className="mb-2">
          <span 
            className="inline-block px-2 py-0.5 rounded text-xs text-white font-medium"
            style={{ backgroundColor: businessUnit.color }}
          >
            {businessUnit.name}
          </span>
        </div>
      )}
      
      {task.description && (
        <p className="text-gray-400 text-xs mb-2 line-clamp-2">{task.description}</p>
      )}
      
      {/* Quick Assign buttons for backlog tasks */}
      {showQuickAssign && (
        <div className="flex gap-2 mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssign('sean');
            }}
            className="flex-1 px-2 py-1.5 bg-blue-600/20 text-blue-400 rounded text-xs hover:bg-blue-600/30 transition"
          >
            👤 Assign Sean
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssign('zet');
            }}
            className="flex-1 px-2 py-1.5 bg-purple-600/20 text-purple-400 rounded text-xs hover:bg-purple-600/30 transition"
          >
            🐙 Assign Zet
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center text-xs flex-wrap gap-1">
        <span className="text-gray-500">
          {getAssigneeInfo(task.assignedTo).emoji} {getAssigneeInfo(task.assignedTo).label}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {task.startDate && (
            <span className={`${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
              📅 {formatDate(task.startDate)}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-xs ${
            task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-green-500/20 text-green-400'
          }`}>
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  );
}
