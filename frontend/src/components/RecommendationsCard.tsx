import { TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Student, University } from '../lib/supabase';
import { getRecommendedUniversities } from '../lib/recommendations';
import { useNavigate } from 'react-router-dom';

interface Props {
  student: Student;
  universities: University[];
  limit?: number;
}

export default function RecommendationsCard({ student, universities, limit = 5 }: Props) {
  const navigate = useNavigate();
  const recommendations = getRecommendedUniversities(student, universities, limit);

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
            <TrendingUp className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Top Matches for You</h3>
            <p className="text-sm text-slate-600">AI-recommended universities</p>
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
        {recommendations.map(({ university, matchScore }) => (
          <div
            key={university.id}
            className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate('/applications')}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {university.name}
                </h4>
                <span className="text-xs text-slate-500">{university.city}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-600">Acceptance: {university.acceptance_rate}%</span>
                <span className="text-slate-600">Fee: ৳{university.application_fee}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Match Score Badge */}
              <div className="text-right">
                <div className={`text-xl font-bold ${
                  matchScore >= 80 ? 'text-green-600' :
                  matchScore >= 60 ? 'text-blue-600' :
                  'text-orange-600'
                }`}>
                  {matchScore}%
                </div>
                <div className="text-xs text-slate-500">Match</div>
              </div>
              {/* Progress Bar */}
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    matchScore >= 80 ? 'bg-green-500' :
                    matchScore >= 60 ? 'bg-blue-500' :
                    'bg-orange-500'
                  }`}
                  style={{ width: `${matchScore}%` }}
                ></div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/applications');
                }}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

