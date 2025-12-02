import { X, CheckCircle2, Clock, AlertCircle, Zap, Bot } from 'lucide-react';
import { useState } from 'react';

export default function BeforeAfterComparison() {
  const [hovered, setHovered] = useState<'before' | 'after' | null>(null);

  const beforeProblems = [
    { icon: Clock, text: '15-20 hours filling forms manually', color: 'text-red-600' },
    { icon: AlertCircle, text: 'Visit 70+ university websites separately', color: 'text-orange-600' },
    { icon: X, text: 'Miss deadlines due to manual tracking', color: 'text-red-600' },
    { icon: AlertCircle, text: 'Manual eligibility calculations', color: 'text-orange-600' },
    { icon: Clock, text: 'Repeated bKash/Nagad payments', color: 'text-yellow-600' },
    { icon: X, text: 'Pay coaching centers for help', color: 'text-red-600' },
  ];

  const afterSolutions = [
    { icon: Zap, text: '5 minutes one-time registration', color: 'text-green-600' },
    { icon: Bot, text: 'AI agent monitors 70+ websites 24/7', color: 'text-blue-600' },
    { icon: CheckCircle2, text: 'Never miss deadlines - auto alerts', color: 'text-green-600' },
    { icon: Zap, text: 'Instant eligibility verification', color: 'text-blue-600' },
    { icon: Bot, text: 'Auto-pay with saved payment methods', color: 'text-green-600' },
    { icon: CheckCircle2, text: 'No middlemen - direct application', color: 'text-green-600' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Before vs After TestPulse</h2>
        <p className="text-slate-600">See how AI automation transforms your admission journey</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Before - Manual Process */}
        <div
          className={`relative rounded-xl p-6 border-2 transition-all duration-300 ${
            hovered === 'before'
              ? 'border-red-300 bg-red-50 shadow-lg scale-105'
              : 'border-red-200 bg-red-50/50'
          }`}
          onMouseEnter={() => setHovered('before')}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="text-red-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-red-900">Manual Process</h3>
          </div>
          
          <div className="space-y-3">
            {beforeProblems.map((problem, idx) => {
              const Icon = problem.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100 ${
                    hovered === 'before' ? 'shadow-md' : ''
                  } transition-all`}
                >
                  <Icon className={`${problem.color} flex-shrink-0 mt-0.5`} size={18} />
                  <span className="text-sm text-slate-700">{problem.text}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-red-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">15-20</div>
              <div className="text-xs text-red-700 font-semibold">Hours Wasted</div>
            </div>
          </div>
        </div>

        {/* After - TestPulse Process */}
        <div
          className={`relative rounded-xl p-6 border-2 transition-all duration-300 ${
            hovered === 'after'
              ? 'border-green-300 bg-green-50 shadow-lg scale-105'
              : 'border-green-200 bg-green-50/50'
          }`}
          onMouseEnter={() => setHovered('after')}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="text-green-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-green-900">With TestPulse</h3>
          </div>
          
          <div className="space-y-3">
            {afterSolutions.map((solution, idx) => {
              const Icon = solution.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100 ${
                    hovered === 'after' ? 'shadow-md' : ''
                  } transition-all`}
                >
                  <Icon className={`${solution.color} flex-shrink-0 mt-0.5`} size={18} />
                  <span className="text-sm text-slate-700">{solution.text}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">5 min</div>
              <div className="text-xs text-green-700 font-semibold">One-Time Setup</div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">15-20h</div>
            <div className="text-xs text-slate-600">Saved Per Student</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">70+</div>
            <div className="text-xs text-slate-600">Universities Covered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">24/7</div>
            <div className="text-xs text-slate-600">AI Monitoring</div>
          </div>
        </div>
      </div>
    </div>
  );
}

