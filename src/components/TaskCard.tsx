'use client';

import { Task } from '@/types/kanban';

interface TaskCardProps {
  task: Task;
  onDelete: () => void;
  isDragging: boolean;
}

const priorityColors = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-red-500',
};

const assigneeEmoji = {
  sean: '👤',
  zet: '🐙',
};

export default function TaskCard({ task, onDelete, isDragging }: TaskCardProps) {
  return (
    <div
      className={`bg-gray-700 rounded-lg p-3 border-l-4 ${priorityColors[task.priority]} ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-medium text-sm">{task.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-red-400 text-xs"
        >
          ✕
        </button>
      </div>
      {task.description && (
        <p className="text-gray-400 text-xs mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500">
          {assigneeEmoji[task.assignedTo]} {task.assignedTo}
        </span>
        <span className={`px-2 py-0.5 rounded text-xs ${
          task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}
