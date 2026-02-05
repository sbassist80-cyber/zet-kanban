'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus, COLUMNS } from '@/types/kanban';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import TaskDetailModal from './TaskDetailModal';

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const updatedTasks = [...tasks];
    const taskIndex = updatedTasks.findIndex(t => t.id === draggableId);
    if (taskIndex === -1) return;

    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      status: destination.droppableId as TaskStatus,
      updatedAt: new Date().toISOString(),
    };

    setTasks(updatedTasks);

    await fetch(`/api/tasks/${draggableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: destination.droppableId }),
    });
  };

  const addTask = async (taskData: Partial<Task>) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const newTask = await res.json();
    setTasks([...tasks, newTask]);
    setIsAddModalOpen(false);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const updatedTask = await res.json();
    setTasks(tasks.map(t => t.id === id ? updatedTask : t));
    setSelectedTask(updatedTask);
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter(t => t.id !== id));
    setSelectedTask(null);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(t => t.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">🐙 Zet Kanban</h1>
            <p className="text-gray-400 mt-1">Sean & Zet Task Management</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Task
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-5 gap-4">
            {COLUMNS.map(column => (
              <div key={column.id} className="bg-gray-800 rounded-lg p-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center justify-between">
                    {column.title}
                    <span className="bg-gray-700 text-gray-300 text-sm px-2 py-1 rounded">
                      {getTasksByStatus(column.id).length}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">{column.description}</p>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] space-y-3 ${
                        snapshot.isDraggingOver ? 'bg-gray-700/50 rounded-lg p-2' : ''
                      }`}
                    >
                      {getTasksByStatus(column.id).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TaskCard
                                task={task}
                                onDelete={() => deleteTask(task.id)}
                                onClick={() => setSelectedTask(task)}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {isAddModalOpen && (
        <AddTaskModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addTask}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updates) => updateTask(selectedTask.id, updates)}
          onDelete={() => deleteTask(selectedTask.id)}
        />
      )}
    </div>
  );
}
