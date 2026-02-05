'use client';

import { Task } from '@/types/kanban';

interface TaskCardProps {
  task: Task;
  onDelete: () => void;
  onClick: () => void;
  isDragging: boolean;
}

const priorityColors = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-red-500',
};

const assigneeDisplay = {
  unassigned: { emoji: '❓', label: 'Unassigned' },
  sean: { emoji: '👤', label: 'Sean' },
  zet: { emoji: '🐙', label: 'Zet' },
};

export default function TaskCard({ task, onDelete, onClick, isDragging }: TaskCardProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-ZA', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const isOverdue = task.startDate && new Date(task.startDate) < new Date() && 
    task.status !== 'done' && task.status !== 'review';

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
      {task.description && (
        <p className="text-gray-400 text-xs mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500">
          {assigneeDisplay[task.assignedTo].emoji} {assigneeDisplay[task.assignedTo].label}
        </span>
        <div className="flex items-center gap-2">
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
