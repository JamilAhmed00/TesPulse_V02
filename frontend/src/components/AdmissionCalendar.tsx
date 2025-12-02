import { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { University, Application } from '../lib/supabase';
import { mockUniversitiesFull } from '../lib/mockData';

interface Props {
  applications?: Application[];
}

interface CalendarEvent {
  date: Date;
  universities: Array<{
    university: University;
    type: 'deadline' | 'exam';
    isApplied: boolean;
  }>;
}

// Generate exam date
const getExamDate = (deadline: Date): Date => {
  const examDate = new Date(deadline);
  examDate.setDate(examDate.getDate() + Math.floor(Math.random() * 15) + 15);
  return examDate;
};

// Gradient "Applied" Badge Component
const AppliedBadge = ({ isText = false }: { isText?: boolean }) => (
  isText ? (
    <span className="flex items-center gap-1.5 text-xs bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-500 font-bold">
      <CheckCircle size={14} className="text-green-500" /> Applied
    </span>
  ) : (
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-teal-500 shadow-sm">
      <CheckCircle className="text-white" size={12} />
    </div>
  )
);

export default function AdmissionCalendar({ applications = [] }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const events = useMemo((): CalendarEvent[] => {
    const eventsMap = new Map<string, CalendarEvent>();
    mockUniversitiesFull.forEach(uni => {
      const deadline = new Date(uni.deadline);
      const examDate = getExamDate(deadline);
      const isApplied = applications.some(app => app.university_id === uni.id);

      const deadlineKey = deadline.toDateString();
      if (!eventsMap.has(deadlineKey)) eventsMap.set(deadlineKey, { date: deadline, universities: [] });
      eventsMap.get(deadlineKey)!.universities.push({ university: uni, type: 'deadline', isApplied });

      const examKey = examDate.toDateString();
      if (!eventsMap.has(examKey)) eventsMap.set(examKey, { date: examDate, universities: [] });
      eventsMap.get(examKey)!.universities.push({ university: uni, type: 'exam', isApplied });
    });
    return Array.from(eventsMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [applications]);

  const getEventsForDate = (date: Date): CalendarEvent['universities'] => {
    const event = events.find(e => e.date.toDateString() === date.toDateString());
    return event ? event.universities : [];
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    const dayEvents = getEventsForDate(date);
    const isAppliedTo = dayEvents.some(e => e.isApplied);

    return isAppliedTo ? (
      <div className="absolute top-1.5 right-1.5"><AppliedBadge /></div>
    ) : null;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const classes = ['relative', 'transition-all', 'duration-200', 'border-l-4'];
    const dayEvents = getEventsForDate(date);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      classes.push('ring-2', 'ring-blue-500', 'ring-offset-2');
    }

    if (dayEvents.length > 0) {
      const hasDeadline = dayEvents.some(e => e.type === 'deadline');
      const hasExam = dayEvents.some(e => e.type === 'exam');

      if (hasDeadline && hasExam) classes.push('border-purple-500', 'bg-purple-50/50');
      else if (hasDeadline) classes.push('border-red-500', 'bg-red-50/50');
      else if (hasExam) classes.push('border-sky-500', 'bg-sky-50/50');
    } else {
      classes.push('border-transparent');
    }

    return classes.join(' ');
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return events.filter(event => event.date.getTime() >= today.getTime()).slice(0, 5);
  }, [events]);

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200/80 shadow-lg shadow-slate-900/5">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl shadow-lg shadow-blue-500/30">
          <CalendarIcon className="text-white" size={28} />
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800">Admission Schedule</h3>
          <p className="text-sm text-slate-500">Key deadlines and exam dates at a glance.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200 flex-wrap text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-red-500"></div><span>Deadline</span></div>
        <div className="flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-sky-500"></div><span>Exam</span></div>
        <div className="flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-purple-500"></div><span>Both</span></div>
        <div className="flex items-center gap-2"><AppliedBadge /> <span className="ml-[-4px]">You Applied</span></div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <style>{`
            .react-calendar { width: 100%; border: none; font-family: 'Inter', sans-serif; }
            .react-calendar__navigation { display: flex; align-items: center; height: 48px; margin-bottom: 1em; }
            .react-calendar__navigation button { min-width: 44px; background: #f1f5f9; border-radius: 0.75rem; color: #334155; border: none; display: flex; align-items: center; justify-content: center; }
            .react-calendar__navigation button:enabled:hover { background-color: #e2e8f0; }
            .react-calendar__navigation__label { font-size: 1.25rem; font-weight: 800; color: #1e293b; flex-grow: 1 !important; text-align: center; }
            .react-calendar__month-view__weekdays { text-align: center; text-transform: uppercase; font-weight: 700; font-size: 0.75rem; color: #64748b; }
            .react-calendar__month-view__weekdays__weekday { padding: 0.5em; }
            .react-calendar__tile { text-align: left; padding: 0.5em; height: 80px; background: white; border-radius: 0.75rem; }
            .react-calendar__tile abbr { font-weight: 700; font-size: 0.9rem; }
            .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .react-calendar__tile--active { background: linear-gradient(135deg, #3b82f6, #14b8a6) !important; color: white; box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4); transform: translateY(-3px); }
            .react-calendar__tile--active abbr, .react-calendar__tile--active .lucide { color: white !important; }
            .react-calendar__month-view__days__day--neighboringMonth { opacity: 0.5; background-color: #f8fafc; }
            .react-calendar__month-view__days__day--neighboringMonth:hover { transform: none; box-shadow: none; }
          `}</style>
          <Calendar
            onChange={(value) => setSelectedDate(value as Date)}
            value={selectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            next2Label={null}
            prev2Label={null}
            nextLabel={<ChevronRight size={20} />}
            prevLabel={<ChevronLeft size={20} />}
            navigationLabel={({ date }) => <span>{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>}
            formatShortWeekday={(locale, date) => date.toLocaleDateString('en-US', { weekday: 'short' })}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedDate && (
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm">
              <h4 className="font-bold text-lg text-slate-800 mb-3">Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h4>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200/80 transition-all hover:border-blue-400">
                      <p className="font-bold text-slate-900">{item.university.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ item.type === 'deadline' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700' }`}>
                          {item.type === 'deadline' ? 'Deadline' : 'Exam'}
                        </span>
                        {item.isApplied && <AppliedBadge isText={true} />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No events scheduled for this day.</p>
              )}
            </div>
          )}

          <div>
            <h4 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2"><Clock size={18} className="text-slate-500" /> Upcoming Events</h4>
            <div className="space-y-3 max-h-[20rem] overflow-y-auto pr-2">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-2 bg-white rounded-xl shadow-sm border border-slate-200/80 hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedDate(event.date)}>
                    <div className={`flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white font-bold bg-gradient-to-br ${event.universities[0].type === 'deadline' ? 'from-red-500 to-orange-400' : 'from-sky-500 to-cyan-400'}`}>
                      <span className="text-xl -mb-1">{event.date.getDate()}</span>
                      <span className="text-xs opacity-80">{event.date.toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 truncate">{event.universities[0].university.name}</p>
                      <p className="text-xs text-slate-500">{event.universities.length > 1 ? `+ ${event.universities.length - 1} more events` : 'See details'}</p>
                    </div>
                    <ChevronRight className="text-slate-400" size={16} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No upcoming events found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}