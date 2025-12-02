import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, FileText, Calendar, BookOpen, CreditCard, AlertCircle, ArrowRight, X, Bot, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import ApplicationTimeline from '../components/ApplicationTimeline';
import { studentStorage, applicationStorage, transactionStorage } from '../lib/storage';
import { mockUniversitiesFull } from '../lib/mockData';
import { generateCircularSummary, formatCircularSummary } from '../lib/circularSummary';
import { Student, University, Application } from '../lib/supabase';

export default function ApplyConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState<Student | null>(null);
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [workflowActive, setWorkflowActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [application, setApplication] = useState<Application | null>(null);

  const workflowSteps = [
    { id: 'fetch', label: 'Agent Fetching Data', icon: Bot, description: 'AI agent is collecting all required information from university website' },
    { id: 'fill', label: 'Filling Application Form', icon: FileText, description: 'Auto-filling all required fields with your information' },
    { id: 'captcha', label: 'Solving CAPTCHA', icon: CheckCircle2, description: 'AI agent is solving security verification' },
    { id: 'payment', label: 'Processing Payment', icon: CreditCard, description: 'Completing payment transaction' },
    { id: 'card', label: 'Downloading Admit Card', icon: FileText, description: 'Fetching and preparing your admission card' },
    { id: 'success', label: 'Application Successful', icon: CheckCircle2, description: 'Your application has been submitted successfully!' },
  ];

  useEffect(() => {
    const loadData = () => {
      try {
        const studentData = studentStorage.getStudent();
        if (!studentData) {
          navigate('/register');
          return;
        }

        // Get university ID from URL params or location state
        const params = new URLSearchParams(location.search);
        const universityId = params.get('university') || (location.state as any)?.universityId;
        
        if (!universityId) {
          navigate('/applications');
          return;
        }

        const uni = mockUniversitiesFull.find(u => u.id === universityId);
        if (!uni) {
          navigate('/applications');
          return;
        }

        setStudent(studentData);
        setUniversity(uni);
        
        // Check if application already exists
        const existingApplications = applicationStorage.getApplications();
        const existingApp = existingApplications.find(a => a.university_id === uni.id);
        if (existingApp) {
          setApplication(existingApp);
          // If application exists and was just submitted, show workflow
          if (existingApp.status === 'submitted' || existingApp.status === 'under_review') {
            setWorkflowActive(true);
            // Determine current step based on application status
            if (existingApp.transaction_id) {
              setCurrentStep(4); // Payment completed, show admit card step
            } else {
              setCurrentStep(3); // Payment step
            }
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        navigate('/applications');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, location]);

  const handleConfirmApply = () => {
    if (!student || !university) return;

    setConfirming(true);

    // Redirect to checkout page
    setTimeout(() => {
      navigate(`/checkout?university=${university.id}`);
    }, 500);
  };

  const startWorkflow = () => {
    // Simulate workflow steps
    workflowSteps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        
        // On payment step, create transaction
        if (step.id === 'payment' && student && university) {
          const transactionId = `TXN-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
          const fee = university.application_fee;
          const newBalance = (student.current_balance || 0) - fee;
          
          const transaction = {
            id: Date.now().toString(),
            student_id: student.id,
            amount: fee,
            type: 'deduction' as const,
            description: `Application fee - ${university.name}`,
            balance_after: newBalance,
            transaction_id: transactionId,
            created_at: new Date().toISOString(),
          };

          transactionStorage.addTransaction(transaction);
          studentStorage.updateStudent({ current_balance: newBalance });
          setStudent({ ...student, current_balance: newBalance });
          
          // Update application with transaction ID
          const applications = applicationStorage.getApplications();
          const app = applications.find(a => a.university_id === university.id);
          if (app) {
            const updatedApp = {
              ...app,
              transaction_id: transactionId,
              status: 'submitted' as const,
              applied_at: new Date().toISOString(),
            };
            applicationStorage.updateApplication(app.id, { 
              transaction_id: transactionId,
              status: 'submitted',
              applied_at: new Date().toISOString(),
            });
            setApplication(updatedApp);
          }
        }
        
        // On admit card step, mark as ready
        if (step.id === 'card' && student && university) {
          const applications = applicationStorage.getApplications();
          const app = applications.find(a => a.university_id === university.id);
          if (app && app.status === 'submitted') {
            // Application is already submitted, card is ready
          }
        }
        
        // On success step, update application and show timeline
        if (step.id === 'success') {
          const applications = applicationStorage.getApplications();
          const app = applications.find(a => a.university_id === university.id);
          if (app) {
            setApplication(app);
          }
          // Keep workflowActive true to show timeline instead of redirecting immediately
          // Optionally redirect after showing timeline for a bit
          setTimeout(() => {
            // Don't auto-redirect, let user see the timeline
          }, 2000);
        }
      }, (index + 1) * 2000); // 2 seconds per step
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] pt-28">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!university || !student) {
    return null;
  }

  const circularSummary = university.circular_text 
    ? generateCircularSummary(university.circular_text)
    : null;

  const deadline = new Date(university.deadline);
  const examDate = new Date(deadline);
  examDate.setDate(examDate.getDate() + 20);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Header />

      <div className="relative z-10 py-8 pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Close Button */}
          <button
            onClick={() => navigate('/applications')}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
            <span>Back to Applications</span>
          </button>

          {!workflowActive ? (
            <>
              {/* University Header */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border-2 border-slate-700/50 mb-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl shadow-lg shadow-violet-500/25">
                    <BookOpen className="text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{university.name}</h1>
                    <p className="text-slate-400">{university.city}</p>
                  </div>
                </div>

                {/* Application Fee & Deadline */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400 mb-1">Application Fee</p>
                    <p className="text-2xl font-bold text-white">৳{university.application_fee}</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400 mb-1">Application Deadline</p>
                    <p className="text-lg font-bold text-white">
                      {deadline.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Circular Summary */}
              {circularSummary && (
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border-2 border-slate-700/50 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="text-violet-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Admission Circular Summary</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-300 mb-1">Deadline</p>
                      <p className="text-white">{circularSummary.deadline}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold text-slate-300 mb-1">Eligibility Criteria</p>
                      <p className="text-white">{circularSummary.eligibility}</p>
                    </div>
                    
                    {circularSummary.examDate && (
                      <div>
                        <p className="text-sm font-semibold text-slate-300 mb-1">Exam Date</p>
                        <p className="text-white">{circularSummary.examDate}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-semibold text-slate-300 mb-1">Required Documents</p>
                      <ul className="list-disc list-inside space-y-1 text-white">
                        {circularSummary.requiredDocuments.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {circularSummary.importantNotes.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-slate-300 mb-1">Important Notes</p>
                        <ul className="list-disc list-inside space-y-1 text-white">
                          {circularSummary.importantNotes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admission Test Process Summary */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border-2 border-slate-700 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-fuchsia-400" size={24} />
                  <h2 className="text-2xl font-bold text-white">Admission Test Process</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-fuchsia-500/10 rounded-lg border border-fuchsia-500/30">
                    <p className="text-sm font-semibold text-fuchsia-400 mb-2">Test Date</p>
                    <p className="text-fuchsia-300">
                      {examDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-violet-500/10 rounded-lg border border-violet-500/30">
                    <p className="text-sm font-semibold text-violet-400 mb-2">Selection Process</p>
                    <ul className="list-disc list-inside space-y-1 text-violet-300">
                      <li>Admission test will be conducted on the scheduled date</li>
                      <li>Selection based on merit list</li>
                      <li>Combined score of HSC marks and admission test</li>
                      <li>Results will be published on university website</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                    <p className="text-sm font-semibold text-emerald-400 mb-2">What You Need to Bring</p>
                    <ul className="list-disc list-inside space-y-1 text-emerald-300">
                      <li>Printed copy of admission card</li>
                      <li>Valid ID card (National ID or Student ID)</li>
                      <li>All original certificates</li>
                      <li>Writing materials</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Balance Check */}
              {student.current_balance < university.application_fee && (
                <div className="bg-rose-500/10 border-2 border-rose-500/30 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="text-rose-400" size={24} />
                    <h3 className="text-lg font-bold text-rose-400">Insufficient Balance</h3>
                  </div>
                  <p className="text-rose-300 mb-4">
                    You need ৳{university.application_fee - (student.current_balance || 0)} more to apply.
                  </p>
                  <button
                    onClick={() => navigate('/balance')}
                    className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
                  >
                    Recharge Now
                  </button>
                </div>
              )}

              {/* Application Timeline - Show if application exists */}
              {application && (
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border-2 border-slate-700 shadow-sm mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Bot className="text-violet-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Application Status</h2>
                  </div>
                  <ApplicationTimeline
                    application={application}
                    university={university}
                    autoApplyEnabled={application.auto_apply_enabled}
                  />
                </div>
              )}

              {/* Confirm Button */}
              {student.current_balance >= university.application_fee && !application && (
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Bot className="text-white" size={28} />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Ready to Apply?</h3>
                      <p className="text-blue-100">
                        Our AI agent will handle the entire application process automatically
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleConfirmApply}
                    disabled={confirming}
                    className="w-full bg-slate-800/50 backdrop-blur-xl text-violet-400 hover:bg-violet-500/10 font-bold py-4 px-6 rounded-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {confirming ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Apply</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Workflow Visualization - Show animated workflow or timeline based on completion */
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border-2 border-slate-700 shadow-sm">
              {application && currentStep >= workflowSteps.length - 1 ? (
                /* Show ApplicationTimeline after workflow completes */
                <div>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-4">
                      <CheckCircle2 className="text-emerald-400" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Application Complete!</h2>
                    <p className="text-slate-400">Your application has been successfully processed</p>
                  </div>
                  <ApplicationTimeline
                    application={application}
                    university={university}
                    autoApplyEnabled={application.auto_apply_enabled}
                  />
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => navigate('/applications')}
                      className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                    >
                      Back to Applications
                    </button>
                  </div>
                </div>
              ) : (
                /* Show animated workflow while processing */
                <div>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-500/20 rounded-full mb-4">
                      <Bot className="text-violet-400 animate-pulse" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">AI Agent Working</h2>
                    <p className="text-slate-400">Your application is being processed automatically</p>
                  </div>

                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>

                    <div className="space-y-6">
                      {workflowSteps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        const isPending = index > currentStep;

                        return (
                          <div key={step.id} className="relative flex items-start gap-6">
                            {/* Timeline Dot */}
                            <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-lg ${
                              isCompleted 
                                ? 'bg-emerald-500/100' 
                                : isCurrent 
                                  ? 'bg-violet-500/100 animate-pulse' 
                                  : 'bg-slate-300'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle2 className="text-white" size={24} />
                              ) : isCurrent ? (
                                <Loader2 className="text-white animate-spin" size={24} />
                              ) : (
                                <StepIcon className="text-white" size={24} />
                              )}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 pt-2 transition-all ${
                              isCurrent ? 'translate-x-2' : ''
                            }`}>
                              <div className={`p-6 rounded-xl border-2 ${
                                isCompleted 
                                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                                  : isCurrent 
                                    ? 'bg-violet-500/10 border-blue-300 shadow-lg' 
                                    : 'bg-slate-900/50 border-slate-700'
                              }`}>
                                <div className="flex items-center gap-3 mb-2">
                                  <StepIcon className={`${
                                    isCompleted ? 'text-emerald-400' :
                                    isCurrent ? 'text-violet-400' :
                                    'text-slate-400'
                                  }`} size={20} />
                                  <h3 className={`font-bold text-lg ${
                                    isCompleted ? 'text-emerald-400' :
                                    isCurrent ? 'text-violet-400' :
                                    'text-slate-500'
                                  }`}>
                                    {step.label}
                                  </h3>
                                </div>
                                <p className={`text-sm ${
                                  isCompleted ? 'text-green-700' :
                                  isCurrent ? 'text-blue-700' :
                                  'text-slate-500'
                                }`}>
                                  {step.description}
                                </p>
                                
                                {isCurrent && (
                                  <div className="mt-4">
                                    <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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

