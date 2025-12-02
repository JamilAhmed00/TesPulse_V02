import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { Application } from '../lib/supabase';

interface Props {
  application: Application;
  compact?: boolean;
}

export default function ProcessStatusIndicator({ application, compact = false }: Props) {
  const getStatusInfo = () => {
    switch (application.status) {
      case 'accepted':
        return {
          label: 'Accepted',
          color: 'green',
          icon: CheckCircle2,
          progress: 100,
        };
      case 'under_review':
        return {
          label: 'Under Review',
          color: 'blue',
          icon: Loader2,
          progress: 75,
        };
      case 'submitted':
        return {
          label: 'Submitted',
          color: 'blue',
          icon: CheckCircle2,
          progress: 60,
        };
      case 'rejected':
        return {
          label: 'Rejected',
          color: 'red',
          icon: XCircle,
          progress: 100,
        };
      default:
        return {
          label: 'Pending',
          color: 'yellow',
          icon: Clock,
          progress: application.transaction_id ? 40 : 20,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          statusInfo.color === 'green' ? 'bg-green-500' :
          statusInfo.color === 'blue' ? 'bg-blue-500' :
          statusInfo.color === 'red' ? 'bg-red-500' :
          'bg-yellow-500'
        }`}></div>
        <span className={`text-xs font-semibold ${
          statusInfo.color === 'green' ? 'text-green-700' :
          statusInfo.color === 'blue' ? 'text-blue-700' :
          statusInfo.color === 'red' ? 'text-red-700' :
          'text-yellow-700'
        }`}>
          {statusInfo.label}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            statusInfo.color === 'green' ? 'bg-green-100' :
            statusInfo.color === 'blue' ? 'bg-blue-100' :
            statusInfo.color === 'red' ? 'bg-red-100' :
            'bg-yellow-100'
          }`}>
            <StatusIcon className={`${
              statusInfo.color === 'green' ? 'text-green-600' :
              statusInfo.color === 'blue' ? 'text-blue-600' :
              statusInfo.color === 'red' ? 'text-red-600' :
              'text-yellow-600'
            } ${statusInfo.color === 'blue' && application.status === 'under_review' ? 'animate-spin' : ''}`} size={16} />
          </div>
          <span className={`text-sm font-semibold ${
            statusInfo.color === 'green' ? 'text-green-700' :
            statusInfo.color === 'blue' ? 'text-blue-700' :
            statusInfo.color === 'red' ? 'text-red-700' :
            'text-yellow-700'
          }`}>
            {statusInfo.label}
          </span>
        </div>
        <span className="text-xs text-slate-500">{statusInfo.progress}%</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            statusInfo.color === 'green' ? 'bg-green-500' :
            statusInfo.color === 'blue' ? 'bg-blue-500' :
            statusInfo.color === 'red' ? 'bg-red-500' :
            'bg-yellow-500'
          }`}
          style={{ width: `${statusInfo.progress}%` }}
        ></div>
      </div>
    </div>
  );
}

