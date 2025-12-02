import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, User, LogIn, FileText, Shield, CreditCard, Download, Calendar, ArrowRight, Bot, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import { studentStorage, applicationStorage, transactionStorage, notificationStorage } from '../lib/storage.ts';
import { mockUniversitiesFull } from '../lib/mockData';
import { Student, University, Application, Notification } from '../lib/supabase';
import { downloadAdmissionCard } from '../lib/admissionCardGenerator';

type WorkflowStep = {
  id: string;
  label: string;
  icon: typeof Bot;
  description: string;
};

export default function AgentCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState<Student | null>(null);
  const [university, setUniversity] = useState<University | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [workflowComplete, setWorkflowComplete] = useState(false);

  const workflowSteps: WorkflowStep[] = [
    { id: 'start', label: 'Agent Start Application', icon: Bot, description: 'Initializing AI agent for automated application process' },
    { id: 'fetch-data', label: 'Fetch User Personal Data', icon: User, description: 'Retrieving your profile and academic credentials from database' },
    { id: 'login', label: 'Automated Admission Login', icon: LogIn, description: 'AI agent logging into university admission portal automatically' },
    { id: 'auto-fill', label: 'Auto Fill Form', icon: FileText, description: 'Populating application form with your information automatically' },
    { id: 'captcha', label: 'Solve Captcha', icon: Shield, description: 'AI agent solving security verification challenges' },
    { id: 'payment', label: 'Make Payment', icon: CreditCard, description: 'Processing application fee payment securely' },
    { id: 'success', label: 'Application Successful', icon: CheckCircle2, description: 'Application submitted successfully to university portal' },
    { id: 'download', label: 'Download Admit Card', icon: Download, description: 'Fetching your admission card from university system' },
  ];

  useEffect(() => {
    const loadData = () => {
      try {
        const studentData = studentStorage.getStudent();
        if (!studentData) {
          navigate('/register');
          return;
        }

        const params = new URLSearchParams(location.search);
        const universityId = params.get('university');
        const applicationId = params.get('application');

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

        const applications = applicationStorage.getApplications();
        const existingApp = applicationId
          ? applications.find(a => a.id === applicationId)
          : applications.find(a => a.university_id === uni.id);

        if (existingApp && (existingApp.status === 'submitted' || existingApp.status === 'under_review' || existingApp.status === 'accepted')) {
          setApplication(existingApp);
          setCurrentStep(workflowSteps.length - 1);
          setWorkflowComplete(true);
          setLoading(false);
        } else if (existingApp && existingApp.status === 'pending' && !existingApp.transaction_id) {
          setApplication(existingApp);
          setLoading(false);
          startWorkflow(studentData, uni, existingApp);
        } else if (!existingApp) {
          const newApp: Application = {
            id: Date.now().toString(),
            student_id: studentData.id,
            university_id: uni.id,
            status: 'pending',
            auto_apply_enabled: true,
            applied_at: null,
            result: null,
            marks_required: 60,
            marks_obtained: studentData.hsc_marks || 70,
            transaction_id: null,
            admission_card_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          applicationStorage.addApplication(newApp);
          setApplication(newApp);
          setLoading(false);
          startWorkflow(studentData, uni, newApp);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        navigate('/applications');
      }
    };

    loadData();
  }, [navigate, location]);

  const startWorkflow = (studentData: Student, uni: University, app: Application) => {
    workflowSteps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);

        if (step.id === 'payment') {
          const transactionId = `TXN-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
          const fee = uni.application_fee;
          const newBalance = (studentData.current_balance || 0) - fee;

          const transaction = {
            id: Date.now().toString(),
            student_id: studentData.id,
            amount: fee,
            type: 'deduction' as const,
            description: `Application fee - ${uni.name}`,
            balance_after: newBalance,
            transaction_id: transactionId,
            created_at: new Date().toISOString(),
          };

          transactionStorage.addTransaction(transaction);
          studentStorage.updateStudent({ current_balance: newBalance });
          setStudent({ ...studentData, current_balance: newBalance });

          applicationStorage.updateApplication(app.id, {
            transaction_id: transactionId,
            status: 'submitted',
            applied_at: new Date().toISOString(),
          });

          const updatedApp = {
            ...app,
            transaction_id: transactionId,
            status: 'submitted' as const,
            applied_at: new Date().toISOString(),
          };
          setApplication(updatedApp);

          const notification: Notification = {
            id: Date.now().toString(),
            student_id: studentData.id,
            type: 'payment',
            title: 'Payment Successful',
            message: `Application fee paid for ${uni.name}. Transaction completed successfully.`,
            related_university_id: uni.id,
            read: false,
            action_url: '/applications',
            circular_summary: null,
            transaction_id: transactionId,
            created_at: new Date().toISOString(),
          };
          notificationStorage.addNotification(notification);
        }

        if (index === workflowSteps.length - 1) {
          setTimeout(() => {
            setWorkflowComplete(true);
          }, 1500);
        }
      }, (index + 1) * 2500);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] pt-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!university || !student || !application) {
    return null;
  }

  const examDate = new Date(university.deadline);
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
        <div className="max-w-5xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full mb-4 shadow-lg shadow-violet-500/30">
              <Bot className="text-white" size={40} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">TestPulse Agent Checkout</h1>
            <p className="text-lg text-slate-400">AI-powered automated application process for {university.name}</p>
          </div>

          {!workflowComplete ? (
            /* Workflow Animation */
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-slate-700/50">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500/50 via-fuchsia-500/50 to-violet-500/50"></div>

                <div className="space-y-8">
                  {workflowSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <div key={step.id} className="relative flex items-start gap-6">
                        <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-xl transition-all duration-500 ${
                          isCompleted
                            ? 'bg-gradient-to-br from-emerald-500 to-cyan-600 scale-100'
                            : isCurrent
                              ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 animate-pulse scale-110'
                              : 'bg-slate-700 scale-90'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="text-white" size={28} />
                          ) : isCurrent ? (
                            <Loader2 className="text-white animate-spin" size={28} />
                          ) : (
                            <span className="text-slate-400 font-bold text-lg">{index + 1}</span>
                          )}
                        </div>

                        <div className={`flex-1 pt-2 transition-all duration-500 ${isCurrent ? 'translate-x-2' : ''}`}>
                          <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                            isCompleted
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : isCurrent
                                ? 'bg-violet-500/10 border-violet-500/50 shadow-lg shadow-violet-500/20'
                                : 'bg-slate-900/50 border-slate-700'
                          }`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-2 rounded-lg ${
                                isCompleted ? 'bg-emerald-500/20' :
                                isCurrent ? 'bg-violet-500/20' :
                                'bg-slate-800'
                              }`}>
                                <StepIcon className={`${
                                  isCompleted ? 'text-emerald-400' :
                                  isCurrent ? 'text-violet-400' :
                                  'text-slate-500'
                                }`} size={24} />
                              </div>
                              <h3 className={`font-bold text-xl ${
                                isCompleted ? 'text-emerald-400' :
                                isCurrent ? 'text-violet-400' :
                                'text-slate-500'
                              }`}>
                                {step.label}
                              </h3>
                            </div>
                            <p className={`text-sm ${
                              isCompleted ? 'text-emerald-300' :
                              isCurrent ? 'text-violet-300' :
                              'text-slate-500'
                            }`}>
                              {step.description}
                            </p>

                            {isCurrent && (
                              <div className="mt-4">
                                <div className="h-2 bg-violet-900/50 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                                </div>
                              </div>
                            )}

                            {isCompleted && (
                              <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
                                <CheckCircle2 size={16} />
                                <span className="font-semibold">Completed</span>
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
          ) : (
            /* Success Summary */
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl shadow-emerald-500/20">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                    <CheckCircle2 size={56} />
                  </div>
                  <h2 className="text-4xl font-bold mb-2">Application Successful!</h2>
                  <p className="text-emerald-100 text-lg">Your application has been submitted to {university.name}</p>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-slate-700/50">
                <h3 className="text-2xl font-bold text-white mb-6">Application Summary</h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/30">
                    <p className="text-sm text-violet-400 font-semibold mb-1">University</p>
                    <p className="text-xl font-bold text-white">{university.name}</p>
                    <p className="text-sm text-slate-400">{university.city}</p>
                  </div>

                  <div className="p-4 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/30">
                    <p className="text-sm text-fuchsia-400 font-semibold mb-1">Application ID</p>
                    <p className="text-xl font-bold text-white">{application.id.slice(0, 12).toUpperCase()}</p>
                    <p className="text-sm text-slate-400">Keep this for reference</p>
                  </div>

                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                    <p className="text-sm text-emerald-400 font-semibold mb-1">Transaction ID</p>
                    <p className="text-lg font-mono text-white">{application.transaction_id}</p>
                    <button
                      onClick={() => {
                        if (application.transaction_id) {
                          navigator.clipboard.writeText(application.transaction_id);
                        }
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold mt-1"
                    >
                      Copy
                    </button>
                  </div>

                  <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                    <p className="text-sm text-amber-400 font-semibold mb-1">Application Fee</p>
                    <p className="text-xl font-bold text-white">৳{university.application_fee}</p>
                    <p className="text-sm text-emerald-400 font-semibold">Paid Successfully</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl p-6 mb-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Calendar size={40} />
                    </div>
                    <div className="flex-1">
                      <p className="text-violet-200 text-sm font-semibold mb-1">Your Exam Date</p>
                      <p className="text-3xl font-bold mb-1">
                        {examDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-violet-200 text-sm">Mark your calendar and prepare well</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      downloadAdmissionCard(student, university, application);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/30"
                  >
                    <Download size={20} />
                    Download Admit Card
                  </button>

                  <button
                    onClick={() => navigate('/applications')}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl transition-all"
                  >
                    View All Applications
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>

              <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-6">
                <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <Calendar className="text-amber-400" size={20} />
                  Important Reminders
                </h4>
                <ul className="space-y-2 text-sm text-amber-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Download and print your admit card before the exam date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Bring your admit card and valid ID to the examination center</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Arrive at least 30 minutes before the exam starts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Check the university website for any updates or announcements</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
