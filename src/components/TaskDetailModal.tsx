'use client';

import { useState } from 'react';
import { Task, TaskStatus, TaskPriority, AssignedTo, COLUMNS } from '@/types/kanban';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

export default function TaskDetailModal({ task, onClose, onUpdate, onDelete }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assignedTo, setAssignedTo] = useState<AssignedTo>(task.assignedTo);
  const [startDate, setStartDate] = useState(task.startDate || '');

  const handleSave = () => {
    onUpdate({
      title,
      description,
      status,
      priority,
      assignedTo,
      startDate: startDate || null,
    });
    setIsEditing(false);
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold text-white bg-gray-700 rounded px-2 py-1 w-full mr-4"
              />
            ) : (
              <h2 className="text-2xl font-bold text-white">{task.title}</h2>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
          </div>

          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              {isEditing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 h-32 resize-none"
                  placeholder="Task description..."
                />
              ) : (
                <p className="text-gray-300 bg-gray-700/50 rounded-lg p-3 min-h-[80px]">
                  {task.description || 'No description'}
                </p>
              )}
            </div>

            {/* Grid of fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                {isEditing ? (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    {COLUMNS.map(col => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white bg-gray-700/50 rounded-lg px-3 py-2">
                    {COLUMNS.find(c => c.id === task.status)?.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Priority</label>
                {isEditing ? (
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                ) : (
                  <p className={`rounded-lg px-3 py-2 ${
                    task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Assigned To</label>
                {isEditing ? (
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value as AssignedTo)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="unassigned">❓ Unassigned</option>
                    <option value="zet">🐙 Zet</option>
                    <option value="sean">👤 Sean</option>
                  </select>
                ) : (
                  <p className="text-white bg-gray-700/50 rounded-lg px-3 py-2">
                    {task.assignedTo === 'zet' ? '🐙 Zet' : 
                     task.assignedTo === 'sean' ? '👤 Sean' : '❓ Unassigned'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  />
                ) : (
                  <p className="text-white bg-gray-700/50 rounded-lg px-3 py-2">
                    {task.startDate ? new Date(task.startDate).toLocaleDateString('en-ZA') : 'Not set'}
                  </p>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t border-gray-700 pt-4 text-sm text-gray-500">
              <p>Created: {formatDateTime(task.createdAt)}</p>
              <p>Updated: {formatDateTime(task.updatedAt)}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onDelete()}
                    className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit Task
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
