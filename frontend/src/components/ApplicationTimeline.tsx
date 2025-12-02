import { CheckCircle2, Clock, Loader2, XCircle, Download, CreditCard, FileText, AlertCircle, Shield, Database } from 'lucide-react';
import { Application, University } from '../lib/supabase';

interface Props {
  application: Application;
  university: University;
  autoApplyEnabled: boolean;
}

type TimelineStage = {
  id: string;
  label: string;
  icon: typeof CheckCircle2;
  status: 'completed' | 'current' | 'pending' | 'error';
  description: string;
  showTransactionId?: boolean;
  showDownload?: boolean;
};

export default function ApplicationTimeline({ application, university, autoApplyEnabled }: Props) {
  const getStages = (): TimelineStage[] => {
    const stages: TimelineStage[] = [];
    
    if (!autoApplyEnabled) {
      // For manual applications, show simplified flow
      stages.push({
        id: 'manual-required',
        label: 'Manual Application Required',
        icon: AlertCircle,
        status: application.status === 'pending' ? 'current' : 'completed',
        description: 'Apply manually through university portal',
      });
      
      if (application.transaction_id) {
        stages.push({
          id: 'payment-made',
          label: 'Payment Made',
          icon: CreditCard,
          status: 'completed',
          description: 'Application fee paid successfully',
          showTransactionId: true,
        });
      }
      
      return stages;
    }

    // Detailed AI Agent Workflow
    // Stage 1: Agent Fetching Data
    stages.push({
      id: 'agent-fetch-data',
      label: 'Agent Fetching Data',
      icon: Database,
      status: application.status === 'pending' && !application.transaction_id ? 'current' : 'completed',
      description: 'AI agent is collecting all required information from university website',
    });

    // Stage 2: Filling Application Form
    stages.push({
      id: 'agent-fill-form',
      label: 'Filling Application Form',
      icon: FileText,
      status: application.status === 'pending' && !application.transaction_id ? 'pending' : 
              application.transaction_id ? 'completed' : 'current',
      description: 'Auto-filling all required fields with your information',
    });

    // Stage 3: Solving CAPTCHA
    stages.push({
      id: 'agent-solve-captcha',
      label: 'Solving CAPTCHA',
      icon: Shield,
      status: application.status === 'pending' && !application.transaction_id ? 'pending' : 
              application.transaction_id ? 'completed' : 'current',
      description: 'AI agent is solving security verification',
    });

    // Stage 4: Processing Payment
    stages.push({
      id: 'payment-processing',
      label: 'Processing Payment',
      icon: CreditCard,
      status: application.transaction_id ? 'completed' : 
              application.status === 'pending' ? 'pending' : 'current',
      description: application.transaction_id ? 'Payment completed successfully' : 'Completing payment transaction',
      showTransactionId: !!application.transaction_id,
    });

    // Stage 5: Downloading Admit Card
    if (application.transaction_id) {
      stages.push({
        id: 'admit-card-download',
        label: 'Downloading Admit Card',
        icon: Download,
        status: (application.status === 'submitted' || application.status === 'under_review' || application.status === 'accepted') 
                ? 'completed' : 'current',
        description: 'Fetching and preparing your admission card',
        showDownload: (application.status === 'submitted' || application.status === 'under_review' || application.status === 'accepted'),
      });
    }

    // Stage 6: Application Successful
    if (application.status === 'submitted' || application.status === 'under_review' || application.status === 'accepted') {
      stages.push({
        id: 'application-successful',
        label: 'Application Successful',
        icon: CheckCircle2,
        status: 'completed',
        description: 'Your application has been submitted successfully!',
      });
    } else if (application.status === 'rejected') {
      stages.push({
        id: 'application-rejected',
        label: 'Application Rejected',
        icon: XCircle,
        status: 'error',
        description: 'Application was not accepted',
      });
    }

    return stages;
  };

  const stages = getStages();
  const currentStageIndex = stages.findIndex(s => s.status === 'current');
  const hasError = stages.some(s => s.status === 'error');

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${
          hasError ? 'bg-red-100' : 
          application.status === 'accepted' ? 'bg-green-100' :
          application.status === 'submitted' || application.status === 'under_review' ? 'bg-blue-100' :
          'bg-slate-100'
        }`}>
          <FileText className={`${
            hasError ? 'text-red-600' :
            application.status === 'accepted' ? 'text-green-600' :
            application.status === 'submitted' || application.status === 'under_review' ? 'text-blue-600' :
            'text-slate-600'
          }`} size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Application Process</h3>
          <p className="text-sm text-slate-600">{university.name}</p>
        </div>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>

        <div className="space-y-6">
          {stages.map((stage, index) => {
            const StageIcon = stage.icon;
            const isPast = index < currentStageIndex || stage.status === 'completed';
            const isCurrent = stage.status === 'current';
            const isError = stage.status === 'error';

            return (
              <div key={stage.id} className="relative flex items-start gap-4">
                {/* Timeline Dot */}
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white ${
                  isError 
                    ? 'bg-red-500' 
                    : isPast 
                      ? 'bg-green-500' 
                      : isCurrent 
                        ? 'bg-blue-500 animate-pulse' 
                        : 'bg-slate-300'
                }`}>
                  {isPast && !isError ? (
                    <CheckCircle2 className="text-white" size={20} />
                  ) : isCurrent ? (
                    <Loader2 className="text-white animate-spin" size={20} />
                  ) : isError ? (
                    <XCircle className="text-white" size={20} />
                  ) : (
                    <Clock className="text-white" size={20} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className={`flex items-center gap-2 mb-1 ${
                    isError ? 'text-red-600' :
                    isPast ? 'text-green-600' :
                    isCurrent ? 'text-blue-600' :
                    'text-slate-400'
                  }`}>
                    <StageIcon size={18} />
                    <h4 className={`font-bold ${
                      isError ? 'text-red-700' :
                      isPast ? 'text-green-700' :
                      isCurrent ? 'text-blue-700' :
                      'text-slate-500'
                    }`}>
                      {stage.label}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{stage.description}</p>
                  
                  {stage.showTransactionId && application.transaction_id && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-1">Transaction ID:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-blue-900 font-mono bg-white px-2 py-1 rounded border border-blue-300">
                          {application.transaction_id}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(application.transaction_id!);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {stage.showDownload && (
                    <div className="mt-2">
                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl">
                        <Download size={16} />
                        Download Admission Card
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Summary */}
      <div className={`mt-6 p-4 rounded-lg border-2 ${
        hasError 
          ? 'bg-red-50 border-red-200' 
          : application.status === 'accepted' 
            ? 'bg-green-50 border-green-200' 
            : application.status === 'submitted' || application.status === 'under_review'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center gap-2">
          {hasError ? (
            <XCircle className="text-red-600" size={20} />
          ) : application.status === 'accepted' ? (
            <CheckCircle2 className="text-green-600" size={20} />
          ) : application.status === 'submitted' || application.status === 'under_review' ? (
            <Loader2 className="text-blue-600 animate-spin" size={20} />
          ) : (
            <Clock className="text-yellow-600" size={20} />
          )}
          <p className={`font-semibold ${
            hasError ? 'text-red-700' :
            application.status === 'accepted' ? 'text-green-700' :
            application.status === 'submitted' || application.status === 'under_review' ? 'text-blue-700' :
            'text-yellow-700'
          }`}>
            {hasError 
              ? 'Application Rejected' 
              : application.status === 'accepted' 
                ? 'Application Accepted!' 
                : application.status === 'submitted' || application.status === 'under_review'
                  ? 'Application Under Review'
                  : autoApplyEnabled
                    ? 'AI Agent Processing...'
                    : 'Manual Action Required'}
          </p>
        </div>
      </div>
    </div>
  );
}
