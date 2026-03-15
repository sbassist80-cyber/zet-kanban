'use client';

import { useEffect, useState } from 'react';
import { Activity } from '@/types/kanban';

const categoryIcons: Record<string, string> = {
  task: '📋',
  meeting: '📅',
  research: '🔬',
  email: '📧',
  dashboard: '📊',
  system: '⚙️',
  other: '💬',
};

const actorColors: Record<string, string> = {
  zet: 'text-purple-400',
  sean: 'text-blue-400',
  system: 'text-gray-400',
};

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString('en-ZA', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  
  return date.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities?limit=50');
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = activity.timestamp.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 h-full">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🐙 Zet Activity Feed
        </h2>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 h-full flex flex-col min-w-[300px] max-w-[350px]">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        🐙 Zet Activity Feed
        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
          {activities.length}
        </span>
      </h2>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {Object.entries(groupedActivities).map(([date, dateActivities]) => (
          <div key={date}>
            <div className="text-xs text-gray-500 font-medium mb-2 sticky top-0 bg-gray-800/90 py-1">
              {formatDate(date)}
            </div>
            <div className="space-y-2">
              {dateActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-gray-700/50 rounded-lg p-3 text-sm hover:bg-gray-700 transition"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{categoryIcons[activity.category] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${actorColors[activity.actor]}`}>
                          {activity.actor === 'zet' ? '🐙 Zet' : activity.actor === 'sean' ? '👤 Sean' : '⚡ System'}
                        </span>
                        <span className="text-gray-500 text-xs">{formatTime(activity.timestamp)}</span>
                      </div>
                      <p className="text-gray-200 break-words">{activity.action}</p>
                      {activity.details && (
                        <p className="text-gray-400 text-xs mt-1 break-words">{activity.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-8">
            No activities yet today
          </div>
        )}
      </div>
    </div>
  );
}
