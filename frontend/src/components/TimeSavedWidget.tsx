import { Clock, FileText, Zap, CheckCircle2 } from 'lucide-react';
import { Application } from '../lib/supabase';
import { useState, useEffect } from 'react';

interface Props {
  applications: Application[];
}

export default function TimeSavedWidget({ applications }: Props) {
  const [animatedHours, setAnimatedHours] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate metrics
  const formsAutoFilled = applications.filter(a => a.auto_apply_enabled).length;
  const totalApplications = applications.length;
  const avgTimePerForm = 1.2; // 1.2 hours per form manually
  const hoursSaved = Math.round(totalApplications * avgTimePerForm);
  const formsAvoided = totalApplications;

  // Animate counter
  useEffect(() => {
    if (mounted) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = hoursSaved / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= hoursSaved) {
          setAnimatedHours(hoursSaved);
          clearInterval(timer);
        } else {
          setAnimatedHours(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [mounted, hoursSaved]);

  const breakdown = [
    {
      icon: FileText,
      label: 'Forms Auto-Filled',
      value: formsAutoFilled,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      icon: Zap,
      label: 'Applications Automated',
      value: totalApplications,
      color: 'text-cyan-600 bg-cyan-100',
    },
    {
      icon: CheckCircle2,
      label: 'Deadlines Caught',
      value: totalApplications,
      color: 'text-green-600 bg-green-100',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl border-2 border-cyan-400/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Clock className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Time Saved</h3>
            <p className="text-blue-100 text-sm">Your AI agent is working for you</p>
          </div>
        </div>

        {/* Main Counter */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-6xl font-extrabold">
              {mounted ? animatedHours : 0}
            </span>
            <span className="text-2xl font-bold text-blue-100">hours</span>
          </div>
          <p className="text-blue-100 text-sm">
            saved vs manual process this season
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-2000"
              style={{ width: `${Math.min((animatedHours / 20) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {breakdown.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 ${
                  mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                } transition-all duration-500`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`inline-flex p-2 ${item.color} rounded-lg mb-2`}>
                  <Icon size={16} />
                </div>
                <div className="text-2xl font-bold mb-1">{item.value}</div>
                <div className="text-xs text-blue-100">{item.label}</div>
              </div>
            );
          })}
        </div>

        {/* Comparison Text */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-sm text-blue-100 text-center">
            <span className="font-semibold">Without TestPulse:</span> {totalApplications * avgTimePerForm} hours filling forms manually
            <br />
            <span className="font-semibold">With TestPulse:</span> 5 minutes of setup
          </p>
        </div>
      </div>
    </div>
  );
}

