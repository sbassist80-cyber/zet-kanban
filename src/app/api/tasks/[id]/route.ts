import { NextRequest, NextResponse } from 'next/server';
import { updateTask, deleteTask, getTask } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  
  // Get current task to check for assignment changes
  const currentTask = getTask(id);
  if (!currentTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  
  // Auto-move logic: when assigning from backlog, move to "assigned" column
  if (body.assignedTo && body.assignedTo !== 'unassigned') {
    if (currentTask.status === 'backlog' && currentTask.assignedTo === 'unassigned') {
      body.status = 'assigned';
    }
  }
  
  // Auto-move back to backlog if unassigning from assigned column
  if (body.assignedTo === 'unassigned' && currentTask.status === 'assigned') {
    body.status = 'backlog';
  }
  
  const task = updateTask(id, body);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const success = deleteTask(id);
  if (!success) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
