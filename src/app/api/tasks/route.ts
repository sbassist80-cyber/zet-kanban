import { NextRequest, NextResponse } from 'next/server';
import { getTasks, addTask, saveTasks } from '@/lib/db';
import { Task } from '@/types/kanban';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const tasks = getTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const task: Task = {
    id: uuidv4(),
    title: body.title,
    description: body.description || '',
    status: body.status || 'backlog',
    priority: body.priority || 'medium',
    assignedTo: body.assignedTo || 'unassigned',
    startDate: body.startDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  addTask(task);
  return NextResponse.json(task, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const tasks = await request.json();
  saveTasks(tasks);
  return NextResponse.json({ success: true });
}
