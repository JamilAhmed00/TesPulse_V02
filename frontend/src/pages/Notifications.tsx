import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import NotificationCard from '../components/NotificationCard';
import { authStorage, notificationStorage } from '../lib/storage.ts';
import { Notification } from '../lib/supabase';

type FilterType = 'all' | 'circular_scrape' | 'payment' | 'application_status' | 'deadline' | 'manual_reminder' | 'system';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authStorage.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const loadNotifications = () => {
      try {
        const allNotifications = notificationStorage.getNotifications();
        setNotifications(allNotifications);
      } catch (err) {
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [navigate]);

  const handleMarkAsRead = (id: string) => {
    notificationStorage.markAsRead(id);
    setNotifications(notificationStorage.getNotifications());
  };

  const handleMarkAllAsRead = () => {
    notificationStorage.markAllAsRead();
    setNotifications(notificationStorage.getNotifications());
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadFiltered = filteredNotifications.filter(n => !n.read).length;

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'circular_scrape', label: 'Circulars', count: notifications.filter(n => n.type === 'circular_scrape').length },
    { value: 'payment', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
    { value: 'application_status', label: 'Applications', count: notifications.filter(n => n.type === 'application_status').length },
    { value: 'deadline', label: 'Deadlines', count: notifications.filter(n => n.type === 'deadline').length },
    { value: 'manual_reminder', label: 'Reminders', count: notifications.filter(n => n.type === 'manual_reminder').length },
    { value: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] pt-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Header />

      <div className="relative z-10 py-8 pt-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl shadow-lg shadow-violet-500/25">
                <Bell className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                <p className="text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/30"
              >
                <CheckCircle2 size={18} />
                Mark All Read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filter === option.value
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-2 border-slate-700'
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filter === option.value
                      ? 'bg-white/20 text-white'
                      : 'bg-violet-500/20 text-violet-400'
                  }`}>
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-12 border-2 border-slate-700 text-center">
              <Bell className="text-slate-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-300 mb-2">No notifications</h3>
              <p className="text-slate-500">
                {filter === 'all' 
                  ? "You're all caught up! Check back later for updates."
                  : `No ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()} notifications.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Unread Section */}
              {unreadFiltered > 0 && (
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                    Unread ({unreadFiltered})
                  </h2>
                  <div className="space-y-3">
                    {filteredNotifications
                      .filter(n => !n.read)
                      .map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Read Section */}
              {filteredNotifications.filter(n => n.read).length > 0 && (
                <div>
                  {unreadFiltered > 0 && (
                    <h2 className="text-lg font-bold text-slate-400 mb-3 mt-6">Read</h2>
                  )}
                  <div className="space-y-3">
                    {filteredNotifications
                      .filter(n => n.read)
                      .map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
