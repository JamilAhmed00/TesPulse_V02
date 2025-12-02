import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle, Info } from 'lucide-react';

const admissionCalls = [
  {
    id: 1,
    university: "Dhaka University (DU)",
    department: "Computer Science and Engineering (CSE)",
    rankRange: "20 to 200",
    studentMeritPosition: 110,
    isEligible: true,
  },
  {
    id: 2,
    university: "BUET",
    department: "Electrical and Electronic Engineering (EEE)",
    rankRange: "1 to 50",
    studentMeritPosition: 25,
    isEligible: true,
  },
  {
    id: 3,
    university: "Jahangirnagar University (JU)",
    department: "Biotechnology and Genetic Engineering",
    rankRange: "50 to 150",
    studentMeritPosition: 200,
    isEligible: false,
  },
  {
    id: 4,
    university: "University of Chittagong (CU)",
    department: "Marine Science",
    rankRange: "100 to 300",
    studentMeritPosition: 430,
    isEligible: false,
  },
];

export default function CallForAdmission() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Header />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">University Admission Calls</h1>
          <p className="text-slate-400 mt-2">
            Based on your merit position, here are the universities calling for admission.
          </p>
        </div>

        <div className="space-y-6">
          {admissionCalls.map(call => (
            <div
              key={call.id}
              className={`bg-slate-800/50 backdrop-blur-xl rounded-xl border-l-4 overflow-hidden border border-slate-700/50 ${
                call.isEligible ? 'border-l-emerald-500' : 'border-l-slate-600'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{call.university}</h2>
                    <p className="text-md text-slate-300 font-medium mt-1">{call.department}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                      call.isEligible
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                    }`}
                  >
                    {call.isEligible ? <CheckCircle size={14} /> : <Info size={14} />}
                    {call.isEligible ? 'You are Eligible' : 'Not in Range'}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
                  <p className="text-sm font-bold">
                    <span className="text-slate-400">Your Position: </span>
                    <span className="text-violet-400 text-base font-extrabold">{call.studentMeritPosition}</span>
                    <span className="text-slate-600 mx-2 font-light">|</span>
                    <span className="text-slate-400">Currently Calling: </span>
                    <span className={`text-base font-extrabold ${call.isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {call.rankRange}
                    </span>
                  </p>
                </div>

                <div className="mt-4 text-sm text-slate-400 bg-slate-900/50 p-4 rounded-md border border-slate-700">
                  <p>
                    <span className="font-semibold text-white">{call.university}</span> is calling students with a merit position rank from <span className="font-bold text-violet-400">{call.rankRange}</span> for the <span className="font-semibold text-white">{call.department}</span> department.
                  </p>
                </div>
                
                {call.isEligible && (
                  <div className="mt-4 p-4 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                    <p className="font-bold text-lg">
                      🎉 Congratulations, you are selected for {call.department} at {call.university}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
