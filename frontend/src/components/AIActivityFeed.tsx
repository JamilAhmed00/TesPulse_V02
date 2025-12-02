import { Bot, CheckCircle2, Clock, Zap, Globe, Bell, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  type: 'scraped' | 'applied' | 'reminder' | 'verified' | 'payment';
  message: string;
  problemSolved: string;
  timeSaved: number; // in hours
  timestamp: string;
  universityName?: string;
}

// Mock activity generator with problem-solving focus
const generateActivities = (): Activity[] => {
  const activities: Activity[] = [];
  const now = new Date();

  activities.push({
    id: '1',
    type: 'scraped',
    message: 'Scraped circular from Dhaka University',
    problemSolved: "You didn't have to check the website manually",
    timeSaved: 0.5,
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    universityName: 'Dhaka University',
  });

  activities.push({
    id: '2',
    type: 'applied',
    message: 'Auto-applied to BUET',
    problemSolved: 'Form auto-filled - saved you 1.2 hours',
    timeSaved: 1.2,
    timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    universityName: 'BUET',
  });

  activities.push({
    id: '3',
    type: 'reminder',
    message: 'Sent deadline reminder for Rajshahi University',
    problemSolved: 'Deadline caught - you won\'t miss it',
    timeSaved: 0,
    timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
    universityName: 'Rajshahi University',
  });

  activities.push({
    id: '4',
    type: 'verified',
    message: 'Verified eligibility for 15 universities',
    problemSolved: 'No manual GPA calculations needed',
    timeSaved: 2.0,
    timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
  });

  activities.push({
    id: '5',
    type: 'payment',
    message: 'Processed payment for Jahangirnagar University',
    problemSolved: 'Auto-paid via saved method - no repeated bKash',
    timeSaved: 0.3,
    timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    universityName: 'Jahangirnagar University',
  });

  return activities;
};

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'scraped':
      return Globe;
    case 'applied':
      return CheckCircle2;
    case 'reminder':
      return Bell;
    case 'verified':
      return Bot;
    case 'payment':
      return Zap;
    default:
      return Clock;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'scraped':
      return 'text-blue-600 bg-blue-100';
    case 'applied':
      return 'text-green-600 bg-green-100';
    case 'reminder':
      return 'text-yellow-600 bg-yellow-100';
    case 'verified':
      return 'text-purple-600 bg-purple-100';
    case 'payment':
      return 'text-cyan-600 bg-cyan-100';
    default:
      return 'text-slate-600 bg-slate-100';
  }
};

interface Props {
  limit?: number;
}

export default function AIActivityFeed({ limit = 5 }: Props) {
  const navigate = useNavigate();
  const activities = generateActivities().slice(0, limit);
  const totalTimeSaved = activities.reduce((sum, a) => sum + a.timeSaved, 0);

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
            <Bot className="text-purple-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI Agent Activity</h3>
            <p className="text-sm text-slate-600">Problems being solved in real-time</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/applications')}
          className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 group transition-colors"
        >
          View All
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Total Time Saved Summary */}
      {totalTimeSaved > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="text-green-600" size={18} />
              <span className="text-sm font-semibold text-slate-900">Total Time Saved:</span>
            </div>
            <span className="text-lg font-bold text-green-600">{totalTimeSaved.toFixed(1)} hours</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all cursor-pointer group border border-slate-200 hover:border-blue-300"
              onClick={() => navigate('/applications')}
            >
              <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                    ✓ {activity.problemSolved}
                  </span>
                  {activity.timeSaved > 0 && (
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                      Saved {activity.timeSaved}h
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Bot className="mx-auto mb-2 opacity-50" size={32} />
          <p className="text-sm">No recent activities</p>
        </div>
      )}
    </div>
  );
}
