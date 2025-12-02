import { useState } from 'react';
import { FileText, ExternalLink, Clock, MapPin, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { University, Application } from '../lib/supabase';
import { generateCircularSummary, formatCircularSummary } from '../lib/circularSummary';

interface Props {
  university: University;
  application?: Application | null;
  onAddToList?: () => void;
}

export default function CircularCard({ university, application, onAddToList }: Props) {
  const [expanded, setExpanded] = useState(false);
  
  const deadline = new Date(university.deadline);
  const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isClosed = daysUntil < 0;
  const isUrgent = daysUntil >= 0 && daysUntil <= 7;
  
  const summary = university.circular_text 
    ? generateCircularSummary(university.circular_text)
    : null;
  const summaryText = summary ? formatCircularSummary(summary) : null;

  const getStatusBadge = () => {
    if (isClosed) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
          <XCircle size={12} />
          Closed
        </span>
      );
    }
    if (application) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
          <CheckCircle2 size={12} />
          Applied
        </span>
      );
    }
    if (isUrgent) {
      return (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
          Urgent
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
        New
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
      isUrgent && !application ? 'border-orange-300 shadow-lg' : 'border-slate-200'
    }`}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">{university.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="text-slate-500" size={14} />
                  <span className="text-sm text-slate-600">{university.city}</span>
                </div>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </div>

        {/* Summary */}
        {summaryText && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-blue-600" size={16} />
              <span className="text-sm font-semibold text-blue-900">Circular Summary</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{summaryText}</p>
          </div>
        )}

        {/* Key Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="text-orange-600" size={18} />
            <div>
              <p className="text-xs text-slate-500">Deadline</p>
              <p className={`font-semibold ${
                isUrgent ? 'text-red-600' : 'text-slate-900'
              }`}>
                {isClosed 
                  ? 'Closed' 
                  : daysUntil === 0 
                    ? 'Today' 
                    : daysUntil === 1 
                      ? 'Tomorrow' 
                      : `${daysUntil} days left`}
              </p>
              <p className="text-xs text-slate-500">
                {deadline.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500">Application Fee</p>
            <p className="font-semibold text-slate-900">৳{university.application_fee}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {university.circular_url && (
            <a
              href={university.circular_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              <ExternalLink size={16} />
              View Full Circular
            </a>
          )}
          {university.guidelines_url && (
            <a
              href={university.guidelines_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 font-semibold rounded-lg transition-all"
            >
              <FileText size={16} />
              Guidelines
            </a>
          )}
          {!application && !isClosed && onAddToList && (
            <button
              onClick={onAddToList}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              Add to My List
            </button>
          )}
        </div>
      </div>

      {/* Expandable Full Circular Text */}
      {university.circular_text && (
        <div className="border-t border-slate-200">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-700">
              {expanded ? 'Hide' : 'Show'} Full Circular Text
            </span>
            {expanded ? (
              <ChevronUp className="text-slate-500" size={20} />
            ) : (
              <ChevronDown className="text-slate-500" size={20} />
            )}
          </button>
          
          {expanded && (
            <div className="px-6 pb-6">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {university.circular_text}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

