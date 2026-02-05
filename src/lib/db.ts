import { Task } from '@/types/kanban';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'tasks.json');

function ensureDbExists() {
  const dir = join(process.cwd(), 'data');
  if (!existsSync(dir)) {
    const { mkdirSync } = require('fs');
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify({ tasks: [] }, null, 2));
  }
}

export function getTasks(): Task[] {
  ensureDbExists();
  const data = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
  return data.tasks;
}

export function saveTasks(tasks: Task[]): void {
  ensureDbExists();
  writeFileSync(DB_PATH, JSON.stringify({ tasks }, null, 2));
}

export function addTask(task: Task): Task {
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
  saveTasks(tasks);
  return tasks[index];
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  if (filtered.length === tasks.length) return false;
  saveTasks(filtered);
  return true;
}
