'use client';

import { useState, useEffect } from 'react';
import { BusinessUnit } from '@/types/kanban';

interface SettingsModalProps {
  onClose: () => void;
  onUpdate: (units: BusinessUnit[]) => void;
  businessUnits: BusinessUnit[];
}

export default function SettingsModal({ onClose, onUpdate, businessUnits }: SettingsModalProps) {
  const [units, setUnits] = useState<BusinessUnit[]>(businessUnits);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366F1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const generateId = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const addUnit = () => {
    if (!newName.trim()) return;
    const newUnit: BusinessUnit = {
      id: generateId(newName),
      name: newName.trim(),
      color: newColor,
    };
    setUnits([...units, newUnit]);
    setNewName('');
    setNewColor('#6366F1');
  };

  const deleteUnit = (id: string) => {
    setUnits(units.filter(u => u.id !== id));
  };

  const startEdit = (unit: BusinessUnit) => {
    setEditingId(unit.id);
    setEditName(unit.name);
    setEditColor(unit.color);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    setUnits(units.map(u => 
      u.id === editingId 
        ? { ...u, name: editName.trim(), color: editColor }
        : u
    ));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('');
  };

  const handleSave = async () => {
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessUnits: units }),
    });
    onUpdate(units);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">⚙️ Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Business Units</h3>
          <p className="text-sm text-gray-400 mb-4">Manage categories for organizing tasks by business unit.</p>
          
          {/* Existing Units */}
          <div className="space-y-2 mb-4">
            {units.map(unit => (
              <div key={unit.id} className="flex items-center gap-2 bg-gray-700 rounded-lg p-2">
                {editingId === unit.id ? (
                  <>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-gray-600 text-white rounded px-2 py-1 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      className="text-green-400 hover:text-green-300 px-2"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-gray-300 px-2"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <div 
                      className="w-6 h-6 rounded flex-shrink-0" 
                      style={{ backgroundColor: unit.color }}
                    />
                    <span className="flex-1 text-white text-sm">{unit.name}</span>
                    <button
                      onClick={() => startEdit(unit)}
                      className="text-gray-400 hover:text-blue-400 px-2"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteUnit(unit.id)}
                      className="text-gray-400 hover:text-red-400 px-2"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add New Unit */}
          <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New business unit name..."
              className="flex-1 bg-gray-600 text-white rounded px-2 py-1 text-sm placeholder-gray-400"
              onKeyDown={(e) => e.key === 'Enter' && addUnit()}
            />
            <button
              onClick={addUnit}
              disabled={!newName.trim()}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
