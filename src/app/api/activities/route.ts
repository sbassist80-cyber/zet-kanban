import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Activity } from '@/types/kanban';

const DATA_FILE = join(process.cwd(), 'data', 'activities.json');

function getActivities(): Activity[] {
  if (!existsSync(DATA_FILE)) {
    return [];
  }
  const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  return data.activities || [];
}

function saveActivities(activities: Activity[]) {
  writeFileSync(DATA_FILE, JSON.stringify({ activities }, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const date = searchParams.get('date'); // Filter by date (YYYY-MM-DD)
  
  let activities = getActivities();
  
  // Sort by timestamp descending (newest first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Filter by date if provided
  if (date) {
    activities = activities.filter(a => a.timestamp.startsWith(date));
  }
  
  // Limit results
  activities = activities.slice(0, limit);
  
  return NextResponse.json(activities);
}

export async function POST(request: Request) {
  const activity: Activity = await request.json();
  
  // Auto-generate ID and timestamp if not provided
  if (!activity.id) {
    activity.id = `act-${Date.now()}`;
  }
  if (!activity.timestamp) {
    activity.timestamp = new Date().toISOString();
  }
  
  const activities = getActivities();
  activities.unshift(activity); // Add to beginning
  
  // Keep only last 500 activities
  const trimmed = activities.slice(0, 500);
  saveActivities(trimmed);
  
  return NextResponse.json(activity);
}
