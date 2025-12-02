import { Bell, FileText, CreditCard, AlertCircle, CheckCircle2, Clock, ExternalLink, Copy } from 'lucide-react';
import { Notification } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Props {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

export default function NotificationCard({ notification, onMarkAsRead }: Props) {
  const navigate = useNavigate();

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'circular_scrape':
        return FileText;
      case 'payment':
        return CreditCard;
      case 'application_status':
        return CheckCircle2;
      case 'deadline':
        return Clock;
      case 'manual_reminder':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'circular_scrape':
        return 'blue';
      case 'payment':
        return 'green';
      case 'application_status':
        return 'purple';
      case 'deadline':
        return 'orange';
      case 'manual_reminder':
        return 'red';
      default:
        return 'slate';
    }
  };

  const Icon = getTypeIcon();
  const color = getTypeColor();

  const handleClick = () => {
    if (notification.action_url) {
      navigate(notification.action_url);
    }
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const copyTransactionId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.transaction_id) {
      navigator.clipboard.writeText(notification.transaction_id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
        notification.read
          ? 'bg-slate-50 border-slate-200'
          : `bg-${color}-50 border-${color}-300`
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-lg ${
          color === 'blue' ? 'bg-blue-100' :
          color === 'green' ? 'bg-green-100' :
          color === 'purple' ? 'bg-purple-100' :
          color === 'orange' ? 'bg-orange-100' :
          color === 'red' ? 'bg-red-100' :
          'bg-slate-100'
        }`}>
          <Icon className={`${
            color === 'blue' ? 'text-blue-600' :
            color === 'green' ? 'text-green-600' :
            color === 'purple' ? 'text-purple-600' :
            color === 'orange' ? 'text-orange-600' :
            color === 'red' ? 'text-red-600' :
            'text-slate-600'
          }`} size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-bold text-sm ${
              notification.read ? 'text-slate-700' : 'text-slate-900'
            }`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
            )}
          </div>

          <p className={`text-sm mb-2 ${
            notification.read ? 'text-slate-600' : 'text-slate-700'
          }`}>
            {notification.message}
          </p>

          {/* Circular Summary */}
          {notification.circular_summary && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-blue-600" size={16} />
                <span className="text-xs font-semibold text-slate-700">Circular Summary</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {notification.circular_summary}
              </p>
            </div>
          )}

          {/* Transaction ID */}
          {notification.transaction_id && (
            <div className="mt-3 p-2 bg-white rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-1">Transaction ID</p>
                  <code className="text-xs text-green-900 font-mono bg-green-50 px-2 py-1 rounded border border-green-300">
                    {notification.transaction_id}
                  </code>
                </div>
                <button
                  onClick={copyTransactionId}
                  className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                  title="Copy Transaction ID"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-500">
              {new Date(notification.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {notification.action_url && (
              <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                <span>View Details</span>
                <ExternalLink size={12} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

