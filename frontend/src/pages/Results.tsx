import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentStorage, applicationStorage } from '../lib/storage';
import { mockExamResults, mockUniversitiesFull } from '../lib/mockData';
import { TrendingUp, BarChart3, FileText, BookOpen, Award } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Results() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [admissionTests, setAdmissionTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const studentData = studentStorage.getStudent();
        if (!studentData) {
          navigate('/register');
          return;
        }

        if (studentData) {
          setStudent(studentData);
          
          const examsWithUni = mockExamResults(studentData.id).map(r => ({
            ...r,
            merit_rank: Math.floor(Math.random() * 500) + 1,
            university_name: mockUniversitiesFull[Math.floor(Math.random() * mockUniversitiesFull.length)].name,
          }));
          setExamResults(examsWithUni);

          const allTests = applicationStorage.getApplications().map((app, index) => {
            const isHeld = index % 2 === 0;
            return {
              ...app,
              exam_status: isHeld ? 'Held' : 'Upcoming',
              merit_position: isHeld ? Math.floor(Math.random() * 1000) + 1 : '-',
              exam_date: new Date(Date.now() + (isHeld ? -1 : 1) * (index + 1) * 24 * 60 * 60 * 1000 * 7).toISOString(),
            };
          });
          setAdmissionTests(allTests);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] pt-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Loading results...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const publishedResultsCount = examResults.length;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Header />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border-l-4 border-violet-500 border border-slate-700/50 flex items-center gap-4">
            <FileText className="text-violet-400" size={32} />
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Applications</p>
              <p className="text-3xl font-bold text-white">{admissionTests.length}</p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border-l-4 border-cyan-500 border border-slate-700/50 flex items-center gap-4">
            <BookOpen className="text-cyan-400" size={32} />
            <div>
              <p className="text-slate-400 text-sm mb-1">Number of Exams</p>
              <p className="text-3xl font-bold text-white">
                {admissionTests.length}
                <span className="text-xl text-slate-500 font-medium"> / {admissionTests.length}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border-l-4 border-emerald-500 border border-slate-700/50 flex items-center gap-4">
            <BarChart3 className="text-emerald-400" size={32} />
            <div>
              <p className="text-slate-400 text-sm mb-1">Published Results</p>
              <p className="text-3xl font-bold text-white">
                {publishedResultsCount}
                <span className="text-xl text-slate-500 font-medium"> / {admissionTests.length}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Exam Results Section */}
        <div className="grid md:grid-cols-1 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border-l-4 border-violet-500 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="text-violet-400" size={24} />
              Published Exam Results
            </h2>
            <div className="space-y-5">
              {examResults.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No exam results available yet</p>
              ) : (
                examResults.map((result) => (
                  <div key={result.id} className="border-l-4 border-violet-500 bg-slate-900/50 rounded-lg p-4 transition-all hover:bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white text-lg">{result.exam_name}</h3>
                        <p className="text-sm font-medium text-slate-400">{result.university_name}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        result.passed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {result.passed ? 'Passed' : 'Not Passed'}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                        <span className="text-slate-300 font-semibold flex items-center gap-2">
                          <Award className="text-amber-400" size={20}/>
                          Merit Position
                        </span>
                        <span className="font-extrabold text-2xl bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                          {result.merit_rank}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detailed Admission Test Breakdown */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 mt-8 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-amber-400" size={24} />
            Detailed Admission Test Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-white">University</th>
                  <th className="px-4 py-3 text-left font-semibold text-white">Exam Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-white">Position</th>
                  <th className="px-4 py-3 text-left font-semibold text-white">Exam Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {admissionTests.map(test => {
                  const uni = mockUniversitiesFull.find(u => u.id === test.university_id);
                  const statusColors = {
                    Held: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
                    Upcoming: 'bg-slate-700/50 text-slate-400 border border-slate-600',
                  };

                  return (
                    <tr key={test.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-4 py-3 font-medium text-white">{uni?.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[test.exam_status as keyof typeof statusColors]}`}>
                          {test.exam_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${test.merit_position === '-' ? 'text-slate-500' : 'text-white'}`}>
                          {test.merit_position}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(test.exam_date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
