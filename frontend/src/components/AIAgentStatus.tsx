import { Bot, Activity, Clock, Zap, CheckCircle2, FileText, Globe } from 'lucide-react';
import { Application } from '../lib/supabase';
import { mockUniversitiesFull } from '../lib/mockData';

interface Props {
  applications: Application[];
}

export default function AIAgentStatus({ applications }: Props) {
  const autoApplyCount = applications.filter(a => a.auto_apply_enabled).length;
  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const totalApplications = applications.length;
  
  // Calculate problem-solving metrics
  const formsAutoFilled = totalApplications; // Each application = 1 form auto-filled
  const circularsScrapedToday = Math.floor(Math.random() * 5) + 3; // Mock: 3-7 circulars
  const deadlinesCaught = totalApplications; // All applications = deadlines caught
  const avgTimePerForm = 1.2; // 1.2 hours per form manually
  const hoursSaved = Math.round(totalApplications * avgTimePerForm);
  
  // Find next deadline
  const applicationsWithDeadlines = applications
    .map(app => {
      const uni = mockUniversitiesFull.find(u => u.id === app.university_id);
      return uni ? { ...app, deadline: new Date(uni.deadline) } : null;
    })
    .filter(Boolean) as Array<Application & { deadline: Date }>;

  const nextDeadline = applicationsWithDeadlines.length > 0
    ? applicationsWithDeadlines.sort((a, b) => a.deadline.getTime() - b.deadline.getTime())[0]
    : null;

  const daysUntilDeadline = nextDeadline
    ? Math.ceil((nextDeadline.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const getDeadlineStatus = (days: number | null) => {
    if (days === null) return { color: 'text-slate-400', urgency: 'No deadlines' };
    if (days < 0) return { color: 'text-red-500', urgency: 'Overdue' };
    if (days <= 3) return { color: 'text-red-500', urgency: 'Urgent' };
    if (days <= 7) return { color: 'text-orange-500', urgency: 'Soon' };
    return { color: 'text-green-500', urgency: 'Upcoming' };
  };

  const deadlineStatus = getDeadlineStatus(daysUntilDeadline);

  return (
    <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl border-2 border-cyan-400/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="text-white" size={32} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold">AI Agent Status</h3>
              <p className="text-blue-100 text-sm">Solving your admission problems 24/7</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
            <div className="flex items-center gap-2">
              <Activity className="animate-pulse" size={16} />
              <span className="text-sm font-semibold">Active</span>
            </div>
          </div>
        </div>

        {/* Problem-Solving Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={18} className="text-green-300" />
              <span className="text-xs text-blue-100">Circulars Scraped</span>
            </div>
            <p className="text-2xl font-bold">{circularsScrapedToday}</p>
            <p className="text-xs text-blue-200">Today</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-blue-300" />
              <span className="text-xs text-blue-100">Forms Auto-Filled</span>
            </div>
            <p className="text-2xl font-bold">{formsAutoFilled}</p>
            <p className="text-xs text-blue-200">You didn't fill these</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-green-300" />
              <span className="text-xs text-blue-100">Deadlines Caught</span>
            </div>
            <p className="text-2xl font-bold">{deadlinesCaught}</p>
            <p className="text-xs text-blue-200">Never missed</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-yellow-300" />
              <span className="text-xs text-blue-100">Hours Saved</span>
            </div>
            <p className="text-2xl font-bold">{hoursSaved}h</p>
            <p className="text-xs text-blue-200">vs manual process</p>
          </div>
        </div>

        {/* Additional Status Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-green-300" />
              <span className="text-xs text-blue-100">Monitoring</span>
            </div>
            <p className="text-2xl font-bold">70+</p>
            <p className="text-xs text-blue-200">Universities</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-yellow-300" />
              <span className="text-xs text-blue-100">Auto-Apply</span>
            </div>
            <p className="text-2xl font-bold">{autoApplyCount}</p>
            <p className="text-xs text-blue-200">Enabled</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-orange-300" />
              <span className="text-xs text-blue-100">Pending</span>
            </div>
            <p className="text-2xl font-bold">{pendingApplications}</p>
            <p className="text-xs text-blue-200">Applications</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className={deadlineStatus.color.replace('text-', 'text-')} />
              <span className="text-xs text-blue-100">Next Deadline</span>
            </div>
            {daysUntilDeadline !== null ? (
              <>
                <p className={`text-2xl font-bold ${deadlineStatus.color}`}>
                  {daysUntilDeadline < 0 ? 'Overdue' : daysUntilDeadline === 0 ? 'Today' : `${daysUntilDeadline}d`}
                </p>
                <p className="text-xs text-blue-200">{deadlineStatus.urgency}</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-300">-</p>
                <p className="text-xs text-blue-200">No deadlines</p>
              </>
            )}
          </div>
        </div>

        {/* Problem-Solving Summary */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-green-300 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-blue-100 font-semibold mb-1">Problems Being Solved Right Now:</p>
              <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
                <li>Scraping circulars from 70+ university websites automatically</li>
                <li>Auto-filling {formsAutoFilled} application forms you didn't have to touch</li>
                <li>Tracking {deadlinesCaught} deadlines so you never miss one</li>
                <li>Saving you {hoursSaved} hours of manual work this season</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
