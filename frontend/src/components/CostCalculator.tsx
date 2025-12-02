import { Wallet, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Student, Application } from '../lib/supabase';
import { mockUniversitiesFull } from '../lib/mockData';

interface Props {
  student: Student;
  applications: Application[];
}

export default function CostCalculator({ student, applications }: Props) {
  const navigate = useNavigate();
  
  // Calculate total cost
  const totalCost = applications.reduce((sum, app) => {
    const uni = mockUniversitiesFull.find(u => u.id === app.university_id);
    return sum + (uni?.application_fee || 0);
  }, 0);

  const currentBalance = student.current_balance || 0;
  const remaining = totalCost - currentBalance;
  const hasInsufficientBalance = remaining > 0;

  // Calculate cost breakdown
  const costBreakdown = applications.slice(0, 3).map(app => {
    const uni = mockUniversitiesFull.find(u => u.id === app.university_id);
    return {
      name: uni?.name || 'Unknown',
      fee: uni?.application_fee || 0,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
            <Wallet className="text-green-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cost Calculator</h3>
            <p className="text-sm text-slate-600">{applications.length} universities selected</p>
          </div>
        </div>
      </div>

      {/* Total Cost */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-slate-900">৳{totalCost.toLocaleString()}</span>
          <span className="text-sm text-slate-600">estimated total</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              hasInsufficientBalance ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((currentBalance / totalCost) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Balance Status */}
      {hasInsufficientBalance ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">Insufficient Balance</p>
              <p className="text-sm text-red-700">
                You need ৳{remaining.toLocaleString()} more to cover all application fees.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            <p className="text-sm font-semibold text-green-900">
              Sufficient balance to cover all applications
            </p>
          </div>
        </div>
      )}

      {/* Quick Breakdown */}
      {costBreakdown.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Top Applications:</p>
          <div className="space-y-2">
            {costBreakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="text-slate-900 font-semibold">৳{item.fee}</span>
              </div>
            ))}
            {applications.length > 3 && (
              <div className="text-xs text-slate-500 text-center pt-1">
                +{applications.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => navigate('/balance')}
        className="w-full group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        <Wallet size={18} />
        <span>{hasInsufficientBalance ? 'Recharge Now' : 'Manage Balance'}</span>
        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
      </button>
    </div>
  );
}

