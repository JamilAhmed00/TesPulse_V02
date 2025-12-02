import { Calendar, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Application } from '../lib/supabase';
import { mockUniversitiesFull } from '../lib/mockData';
import { useNavigate } from 'react-router-dom';

interface Props {
  applications: Application[];
}

export default function DeadlineCalendar({ applications }: Props) {
  const navigate = useNavigate();

  // Get applications with deadlines
  const appsWithDeadlines = applications
    .map(app => {
      const uni = mockUniversitiesFull.find(u => u.id === app.university_id);
      if (!uni) return null;
      const deadline = new Date(uni.deadline);
      const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        ...app,
        university: uni,
        deadline,
        daysUntil,
      };
    })
    .filter(Boolean) as Array<Application & { university: typeof mockUniversitiesFull[0]; deadline: Date; daysUntil: number }>;

  // Sort by deadline
  appsWithDeadlines.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

  // Get upcoming deadlines (next 7)
  const upcomingDeadlines = appsWithDeadlines.slice(0, 7);

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-red-600 bg-red-100 border-red-200';
    if (days <= 3) return 'text-red-600 bg-red-50 border-red-200';
    if (days <= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getUrgencyLabel = (days: number) => {
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `${days} days`;
    return `${days} days`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
            <Calendar className="text-orange-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Upcoming Deadlines</h3>
            <p className="text-sm text-slate-600">{upcomingDeadlines.length} deadlines</p>
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

      <div className="space-y-3">
        {upcomingDeadlines.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Calendar className="mx-auto mb-2 opacity-50" size={32} />
            <p className="text-sm">No upcoming deadlines</p>
          </div>
        ) : (
          upcomingDeadlines.map((app) => {
            const urgencyColor = getUrgencyColor(app.daysUntil);
            const urgencyLabel = getUrgencyLabel(app.daysUntil);

            return (
              <div
                key={app.id}
                className={`p-4 rounded-xl border-2 cursor-pointer hover:shadow-md transition-all ${urgencyColor}`}
                onClick={() => navigate('/applications')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 mb-1 truncate">
                      {app.university.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {app.deadline.toLocaleDateString()}
                      </span>
                      {app.auto_apply_enabled && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                          Auto-Apply
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-lg font-bold ${urgencyColor.split(' ')[0]}`}>
                      {urgencyLabel}
                    </div>
                    {app.daysUntil <= 3 && app.daysUntil >= 0 && (
                      <AlertTriangle className="mt-1 mx-auto" size={16} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

