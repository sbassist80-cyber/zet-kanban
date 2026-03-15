'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useSession, signOut } from 'next-auth/react';
import { Task, TaskStatus, AssignedTo, BusinessUnit, COLUMNS, DEFAULT_BUSINESS_UNITS } from '@/types/kanban';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import TaskDetailModal from './TaskDetailModal';
import SettingsModal from './SettingsModal';
import ActivityFeed from './ActivityFeed';

export default function KanbanBoard() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>(DEFAULT_BUSINESS_UNITS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterBusinessUnit, setFilterBusinessUnit] = useState<string>('');
  const [mobileColumn, setMobileColumn] = useState<TaskStatus>('backlog');

  useEffect(() => {
    fetchTasks();
    fetchSettings();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.businessUnits && data.businessUnits.length > 0) {
        setBusinessUnits(data.businessUnits);
      }
    } catch {
      // Use defaults if settings fetch fails
    }
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
    if (selectedTask?.id === id) {
      setSelectedTask(updatedTask);
    }
  };

  const assignTask = async (id: string, assignee: AssignedTo) => {
    const today = new Date().toISOString().split('T')[0];
    await updateTask(id, { assignedTo: assignee, startDate: today });
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter(t => t.id !== id));
    setSelectedTask(null);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks
      .filter(t => t.status === status)
      .filter(t => !filterBusinessUnit || t.businessUnit === filterBusinessUnit);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-3 sm:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">🐙 Zet Kanban</h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">Sean & Zet Task Management</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {session?.user && (
              <div className="hidden sm:flex items-center gap-3">
                {session.user.image && (
                  <img 
                    src={session.user.image} 
                    alt="" 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-gray-300 text-sm">{session.user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1 text-sm text-gray-400 hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            )}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition text-sm"
            >
              ⚙️ Settings
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
            >
              + Add Task
            </button>
          </div>
        </div>

        {/* Filter by Business Unit */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-gray-400 text-sm">Filter:</span>
          <button
            onClick={() => setFilterBusinessUnit('')}
            className={`px-3 py-1 rounded-full text-xs transition ${
              !filterBusinessUnit 
                ? 'bg-white text-gray-900' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {businessUnits.map(unit => (
            <button
              key={unit.id}
              onClick={() => setFilterBusinessUnit(unit.id)}
              className={`px-3 py-1 rounded-full text-xs transition ${
                filterBusinessUnit === unit.id 
                  ? 'text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
              style={{ 
                backgroundColor: filterBusinessUnit === unit.id ? unit.color : `${unit.color}40`
              }}
            >
              {unit.name}
            </button>
          ))}
        </div>

        {/* Mobile Column Selector */}
        <div className="sm:hidden mb-4 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {COLUMNS.map(column => (
              <button
                key={column.id}
                onClick={() => setMobileColumn(column.id)}
                className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                  mobileColumn === column.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {column.title} ({getTasksByStatus(column.id).length})
              </button>
            ))}
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          {/* Desktop: Show all columns + Activity Feed */}
          <div className="hidden sm:grid sm:grid-cols-6 gap-4">
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
                                onAssign={(assignee) => assignTask(task.id, assignee)}
                                isDragging={snapshot.isDragging}
                                businessUnits={businessUnits}
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
            
            {/* Activity Feed Column */}
            <ActivityFeed />
          </div>

          {/* Mobile: Show single column */}
          <div className="sm:hidden">
            {COLUMNS.filter(col => col.id === mobileColumn).map(column => (
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
                      className={`min-h-[300px] space-y-3 ${
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
                                onAssign={(assignee) => assignTask(task.id, assignee)}
                                isDragging={snapshot.isDragging}
                                businessUnits={businessUnits}
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

        {/* Mobile Logout */}
        {session?.user && (
          <div className="sm:hidden mt-6 text-center">
            <p className="text-gray-400 text-sm mb-2">{session.user.email}</p>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <AddTaskModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addTask}
          businessUnits={businessUnits}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updates) => updateTask(selectedTask.id, updates)}
          onDelete={() => deleteTask(selectedTask.id)}
          businessUnits={businessUnits}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onUpdate={setBusinessUnits}
          businessUnits={businessUnits}
        />
      )}
    </div>
  );
}
