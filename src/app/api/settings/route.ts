import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const SETTINGS_FILE = join(process.cwd(), 'data', 'settings.json');

async function getSettings() {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { businessUnits: [] };
  }
}

async function saveSettings(settings: any) {
  await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  await saveSettings(body);
  return NextResponse.json(body);
}

export async function PATCH(request: NextRequest) {
  const settings = await getSettings();
  const updates = await request.json();
  
  if (updates.businessUnits) {
    settings.businessUnits = updates.businessUnits;
  }
  
  await saveSettings(settings);
  return NextResponse.json(settings);
}
