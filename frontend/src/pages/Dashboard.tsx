import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { 
  Wallet, ArrowRight, Clock, Zap, Activity,
  GraduationCap, User, Mail, Phone, MapPin, Calendar, Award, School, Edit,
  ExternalLink, AlertCircle, CheckCircle, XCircle, Building2, ChevronDown, ChevronUp,
  FileText, Globe, Target, Star, Filter, Search, Sparkles, TrendingUp
} from 'lucide-react';
import Header from '../components/Header';
import { useGetCurrentUser } from '../hooks/api/auth';
import { useListApplications } from '../hooks/api/applications';
import { useGetStudentByUser } from '../hooks/api/students';
import { useListResults } from '../hooks/api/results';
import { userAtom } from '../store/auth';
import Footer from '../components/Footer';
import type { AdmissionCircularData } from '../types/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAtomValue(userAtom);
  const { data: currentUser, refetch: refetchUser } = useGetCurrentUser();
  const { data: studentProfile, isLoading: studentLoading } = useGetStudentByUser(!!user);
  const { data: applicationsData, isLoading: applicationsLoading } = useListApplications(
    { studentId: user?.id || null },
    1,
    20,
    !!user
  );
  const { data: resultsData, isLoading: resultsLoading } = useListResults(
    1,
    100,
    'completed',
    !!user
  );
  const [mounted, setMounted] = useState(false);
  const [expandedUniversity, setExpandedUniversity] = useState<string | null>(null);
  const [filterEligible, setFilterEligible] = useState<'all' | 'eligible' | 'not-eligible'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'universities' | 'profile'>('overview');

  useEffect(() => {
    setMounted(true);
    if (user) {
      refetchUser();
    }
  }, [user, refetchUser]);

  // Redirect to registration if student profile doesn't exist
  useEffect(() => {
    if (user && !studentLoading && !studentProfile) {
      navigate('/register');
    }
  }, [user, studentLoading, studentProfile, navigate]);

  const loading = applicationsLoading || studentLoading || resultsLoading;
  const applications = applicationsData?.applications || [];
  const student = currentUser;

  // Extract universities from results
  const universities = useMemo(() => {
    if (!resultsData?.results) return [];
    return resultsData.results
      .filter(result => {
        return result.status === 'completed' && result.data !== null && result.data !== undefined;
      })
      .map(result => ({ ...result.data!, resultId: result.id }))
      .filter((data): data is AdmissionCircularData & { resultId: string } => {
        return data !== null && data !== undefined && !!data.universityName;
      });
  }, [resultsData]);

  // Check eligibility function
  const checkEligibility = (circular: AdmissionCircularData): { eligible: boolean; reasons: string[]; score: number } => {
    const reasons: string[] = [];
    let eligible = true;
    let score = 100;

    if (!studentProfile) {
      return { eligible: false, reasons: ['Student profile not found'], score: 0 };
    }

    const sscGpa = studentProfile.ssc_gpa ? parseFloat(studentProfile.ssc_gpa) : null;
    const hscGpa = studentProfile.hsc_gpa ? parseFloat(studentProfile.hsc_gpa) : null;
    const totalGpa = sscGpa && hscGpa ? sscGpa + hscGpa : null;

    // Check general GPA requirements
    const gpaReq = circular.generalGpaRequirements;
    if (gpaReq.ssc && sscGpa !== null && sscGpa < gpaReq.ssc) {
      eligible = false;
      score -= 30;
      reasons.push(`SSC GPA: Required ${gpaReq.ssc}, yours ${sscGpa}`);
    }
    if (gpaReq.hsc && hscGpa !== null && hscGpa < gpaReq.hsc) {
      eligible = false;
      score -= 30;
      reasons.push(`HSC GPA: Required ${gpaReq.hsc}, yours ${hscGpa}`);
    }
    if (gpaReq.total && totalGpa !== null && totalGpa < gpaReq.total) {
      eligible = false;
      score -= 20;
      reasons.push(`Total GPA: Required ${gpaReq.total}, yours ${totalGpa.toFixed(2)}`);
    }

    // Check year requirements
    if (circular.yearRequirements) {
      if (circular.yearRequirements.sscYears.length > 0 && studentProfile.ssc_year) {
        if (!circular.yearRequirements.sscYears.includes(studentProfile.ssc_year)) {
          eligible = false;
          score -= 10;
          reasons.push(`SSC year must be: ${circular.yearRequirements.sscYears.join(', ')}`);
        }
      }
      if (circular.yearRequirements.hscYears.length > 0 && studentProfile.hsc_year) {
        if (!circular.yearRequirements.hscYears.includes(studentProfile.hsc_year)) {
          eligible = false;
          score -= 10;
          reasons.push(`HSC year must be: ${circular.yearRequirements.hscYears.join(', ')}`);
        }
      }
    }

    if (eligible && reasons.length === 0) {
      reasons.push('All requirements met');
    }

    return { eligible, reasons, score: Math.max(0, score) };
  };

  // Filter universities
  const filteredUniversities = useMemo(() => {
    return universities.filter(uni => {
      const eligibility = checkEligibility(uni);
      
      // Filter by eligibility
      if (filterEligible === 'eligible' && !eligibility.eligible) return false;
      if (filterEligible === 'not-eligible' && eligibility.eligible) return false;
      
      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return uni.universityName?.toLowerCase().includes(query);
      }
      
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universities, filterEligible, searchQuery, studentProfile]);

  // Stats
  const eligibleCount = universities.filter(u => checkEligibility(u).eligible).length;
  const openCount = universities.filter(u => {
    const start = u.applicationPeriod?.start ? new Date(u.applicationPeriod.start) : null;
    const end = u.applicationPeriod?.end ? new Date(u.applicationPeriod.end) : null;
    const now = new Date();
    return start && end && now >= start && now <= end;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto text-violet-400" size={32} />
            </div>
            <p className="text-slate-400 font-medium text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-4">
          <div className="text-center bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-10 border border-slate-700/50 max-w-md w-full">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/25">
              <User className="text-white" size={40} />
            </div>
            <p className="text-2xl text-white mb-3 font-bold">Complete Your Profile</p>
            <p className="text-slate-400 mb-6">Set up your student profile to access all features</p>
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02]"
            >
              Complete Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Animated background - z-0 to stay behind header */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[80px] animate-pulse delay-500"></div>
      </div>

      <Header />

      <div className="relative z-10 w-full pt-20 md:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className={`mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <span className="text-2xl">👋</span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Welcome back</p>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                      {studentProfile?.candidate_name || (student as { full_name?: string })?.full_name?.split(' ')[0] || 'Student'}
                </h1>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-xl transition-all border border-slate-700/50"
                >
                  <Edit size={18} />
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>
            </div>
          </div>
        </div>

          {/* Navigation Tabs */}
          <div className={`mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 p-1.5 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 w-fit">
              {[
                { id: 'overview' as const, label: 'Overview', icon: TrendingUp },
                { id: 'universities' as const, label: 'Universities', icon: Building2 },
                { id: 'profile' as const, label: 'My Profile', icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="group bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 backdrop-blur-sm rounded-2xl p-5 border border-violet-500/20 hover:border-violet-500/40 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                      <Building2 className="text-white" size={24} />
                    </div>
                    <TrendingUp className="text-violet-400" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{universities.length}</p>
                  <p className="text-sm text-slate-400">Total Universities</p>
                </div>

                <div className="group bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <CheckCircle className="text-white" size={24} />
                    </div>
                    <Star className="text-emerald-400" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{eligibleCount}</p>
                  <p className="text-sm text-slate-400">Eligible For</p>
                </div>

                <div className="group bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-5 border border-amber-500/20 hover:border-amber-500/40 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                      <Clock className="text-white" size={24} />
                    </div>
                    <Zap className="text-amber-400" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{openCount}</p>
                  <p className="text-sm text-slate-400">Open Now</p>
                </div>

                <div className="group bg-gradient-to-br from-rose-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-5 border border-rose-500/20 hover:border-rose-500/40 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/25">
                      <Target className="text-white" size={24} />
                    </div>
                    <Activity className="text-rose-400" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{applications.length}</p>
                  <p className="text-sm text-slate-400">Applications</p>
                </div>
              </div>

              {/* Academic Summary */}
              {studentProfile && (
                <div className={`bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                      <GraduationCap className="text-white" size={20} />
                    </div>
                    Your Academic Profile
                  </h2>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* SSC Card */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                      <div className="flex items-center gap-2 mb-3">
                        <School className="text-violet-400" size={18} />
                        <span className="font-semibold text-white">SSC</span>
                      </div>
                      <div className="space-y-2">
                        {studentProfile.ssc_gpa && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">GPA</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                              {studentProfile.ssc_gpa}
                            </span>
                          </div>
                        )}
                        {studentProfile.ssc_year && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Year</span>
                            <span className="text-slate-300">{studentProfile.ssc_year}</span>
            </div>
                        )}
                        {studentProfile.ssc_board && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Board</span>
                            <span className="text-slate-300">{studentProfile.ssc_board}</span>
            </div>
                        )}
            </div>
          </div>

                    {/* HSC Card */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                      <div className="flex items-center gap-2 mb-3">
                        <School className="text-cyan-400" size={18} />
                        <span className="font-semibold text-white">HSC</span>
                      </div>
                      <div className="space-y-2">
                        {studentProfile.hsc_gpa && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">GPA</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                              {studentProfile.hsc_gpa}
                            </span>
                          </div>
                        )}
                        {studentProfile.hsc_year && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Year</span>
                            <span className="text-slate-300">{studentProfile.hsc_year}</span>
                          </div>
                        )}
                        {studentProfile.hsc_board && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Board</span>
                            <span className="text-slate-300">{studentProfile.hsc_board}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total GPA */}
                    <div className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl p-4 border border-violet-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="text-amber-400" size={18} />
                        <span className="font-semibold text-white">Total GPA</span>
                      </div>
                      <div className="text-center py-2">
                        <span className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                          {studentProfile.ssc_gpa && studentProfile.hsc_gpa 
                            ? (parseFloat(studentProfile.ssc_gpa) + parseFloat(studentProfile.hsc_gpa)).toFixed(2)
                            : 'N/A'
                          }
                        </span>
                        <p className="text-slate-400 text-xs mt-1">SSC + HSC Combined</p>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="text-emerald-400" size={18} />
                        <span className="font-semibold text-white">Quick Info</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {studentProfile.gender && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Gender</span>
                            <span className="text-slate-300">{studentProfile.gender}</span>
                          </div>
                        )}
                        {studentProfile.nationality && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Nationality</span>
                            <span className="text-slate-300">{studentProfile.nationality}</span>
                          </div>
                        )}
                        {studentProfile.mobile_number && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Mobile</span>
                            <span className="text-slate-300">{studentProfile.mobile_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Eligible Universities Preview */}
              <div className={`bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Star className="text-white" size={20} />
                    </div>
                    Top Matches For You
                  </h2>
                  <button
                    onClick={() => setActiveTab('universities')}
                    className="text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center gap-1"
                  >
                    View All <ArrowRight size={16} />
                  </button>
                </div>

                {eligibleCount === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto text-slate-500 mb-3" size={40} />
                    <p className="text-slate-400">No eligible universities found based on your profile</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {universities
                      .filter(u => checkEligibility(u).eligible)
                      .slice(0, 3)
                      .map((uni, idx) => {
                        const startDate = uni.applicationPeriod?.start ? new Date(uni.applicationPeriod.start) : null;
                        const endDate = uni.applicationPeriod?.end ? new Date(uni.applicationPeriod.end) : null;
                        const now = new Date();
                        const isOpen = startDate && endDate && now >= startDate && now <= endDate;
                        const uniWithId = uni as AdmissionCircularData & { resultId: string };
                        
                        return (
                          <div
                            key={idx}
                            className="bg-slate-900/50 rounded-xl p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer hover:scale-[1.02]"
                            onClick={() => {
                              setActiveTab('universities');
                              setExpandedUniversity(uniWithId.resultId);
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-white text-sm line-clamp-2">{uni.universityName}</h3>
                              {isOpen && (
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium whitespace-nowrap ml-2">
                                  Open
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 text-xs">
                              {uni.generalGpaRequirements && (
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Award size={12} />
                                  <span>
                                    SSC: {uni.generalGpaRequirements.ssc || 'N/A'} | HSC: {uni.generalGpaRequirements.hsc || 'N/A'}
                                  </span>
                                </div>
                              )}
                              {endDate && (
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Calendar size={12} />
                                  <span>Deadline: {endDate.toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Universities Tab */}
          {activeTab === 'universities' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search universities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-400" size={20} />
                  {([
                    { id: 'all' as const, label: 'All' },
                    { id: 'eligible' as const, label: 'Eligible' },
                    { id: 'not-eligible' as const, label: 'Not Eligible' },
                  ]).map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setFilterEligible(filter.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterEligible === filter.id
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Count */}
              <p className="text-slate-400 text-sm">
                Showing {filteredUniversities.length} of {universities.length} universities
              </p>

              {/* Universities List */}
              {resultsLoading ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading universities...</p>
                </div>
              ) : filteredUniversities.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <Building2 className="mx-auto text-slate-600 mb-4" size={48} />
                  <p className="text-slate-400 mb-2">No universities found</p>
                  <p className="text-slate-500 text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUniversities.map((circular) => {
                    const eligibility = checkEligibility(circular);
                    const startDate = circular.applicationPeriod?.start ? new Date(circular.applicationPeriod.start) : null;
                    const endDate = circular.applicationPeriod?.end ? new Date(circular.applicationPeriod.end) : null;
                    const now = new Date();
                    const isOpen = startDate && endDate && now >= startDate && now <= endDate;
                    const isUpcoming = startDate && now < startDate;
                    const isClosed = endDate && now > endDate;
                    const circularWithId = circular as AdmissionCircularData & { resultId: string };
                    const isExpanded = expandedUniversity === circularWithId.resultId;

                    return (
                      <div
                        key={circularWithId.resultId}
                        className={`bg-slate-800/30 backdrop-blur-sm rounded-2xl border transition-all overflow-hidden ${
                          eligibility.eligible
                            ? 'border-emerald-500/30 hover:border-emerald-500/50'
                            : 'border-slate-700/50 hover:border-slate-600/50'
                        }`}
                      >
                        {/* Header - Always Visible */}
                        <div
                          className="p-5 cursor-pointer"
                          onClick={() => setExpandedUniversity(isExpanded ? null : circularWithId.resultId)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-lg font-bold text-white">{circular.universityName}</h3>
                                
                                {/* Status Badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {eligibility.eligible ? (
                                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold">
                                      <CheckCircle size={14} />
                                      Eligible
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold">
                                      <XCircle size={14} />
                                      Not Eligible
                                    </span>
                                  )}
                                  
                                  {isOpen && (
                                    <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-semibold">
                                      Open Now
                                    </span>
                                  )}
                                  {isUpcoming && (
                                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold">
                                      Upcoming
                                    </span>
                                  )}
                                  {isClosed && (
                                    <span className="px-2.5 py-1 bg-slate-500/20 text-slate-400 rounded-lg text-xs font-semibold">
                                      Closed
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quick Info Row */}
                              <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                                {circular.generalGpaRequirements && (
                                  <div className="flex items-center gap-1.5">
                                    <Award size={14} className="text-amber-400" />
                                    <span>
                                      SSC: {circular.generalGpaRequirements.ssc || 'N/A'} | 
                                      HSC: {circular.generalGpaRequirements.hsc || 'N/A'}
                                      {circular.generalGpaRequirements.total && ` | Total: ${circular.generalGpaRequirements.total}`}
                                    </span>
                                  </div>
                                )}
                                {endDate && (
                                  <div className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-violet-400" />
                                    <span>Deadline: {endDate.toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="text-slate-400" size={24} />
                              ) : (
                                <ChevronDown className="text-slate-400" size={24} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="px-5 pb-5 border-t border-slate-700/30 pt-5 space-y-5">
                            {/* Application Period & Fee */}
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="text-violet-400" size={18} />
                                  <span className="font-semibold text-white text-sm">Application Period</span>
                                </div>
                                {startDate && endDate ? (
                                  <div className="space-y-1 text-sm">
                                    <p className="text-slate-300">
                                      <span className="text-slate-500">Start:</span> {startDate.toLocaleDateString()}
                                    </p>
                                    <p className="text-slate-300">
                                      <span className="text-slate-500">End:</span> {endDate.toLocaleDateString()}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-slate-500 text-sm">Not specified</p>
                                )}
                              </div>

                              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <Wallet className="text-emerald-400" size={18} />
                                  <span className="font-semibold text-white text-sm">Application Fee</span>
                                </div>
                                <p className="text-lg font-bold text-emerald-400">
                                  {circular.applicationFee || 'Not specified'}
                                </p>
                              </div>

                              {circular.examDate && (
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText className="text-amber-400" size={18} />
                                    <span className="font-semibold text-white text-sm">Exam Date</span>
                                  </div>
                                  <p className="text-lg font-bold text-amber-400">
                                    {new Date(circular.examDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Eligibility Details */}
                            <div className={`rounded-xl p-4 border ${
                              eligibility.eligible 
                                ? 'bg-emerald-500/10 border-emerald-500/30' 
                                : 'bg-rose-500/10 border-rose-500/30'
                            }`}>
                              <div className="flex items-start gap-3">
                                {eligibility.eligible ? (
                                  <CheckCircle className="text-emerald-400 mt-0.5 flex-shrink-0" size={20} />
                                ) : (
                                  <AlertCircle className="text-rose-400 mt-0.5 flex-shrink-0" size={20} />
                                )}
                                <div className="flex-1">
                                  <p className={`font-semibold mb-2 ${
                                    eligibility.eligible ? 'text-emerald-400' : 'text-rose-400'
                                  }`}>
                                    {eligibility.eligible ? 'You are eligible for this university!' : 'You do not meet the requirements'}
                                  </p>
                                  <ul className="space-y-1">
                                    {eligibility.reasons.map((reason, idx) => (
                                      <li key={idx} className={`text-sm flex items-center gap-2 ${
                                        eligibility.eligible ? 'text-emerald-300/80' : 'text-rose-300/80'
                                      }`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                        {reason}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Department Requirements */}
                            {circular.departmentWiseRequirements && circular.departmentWiseRequirements.length > 0 && (
                              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-4">
                                  <School className="text-violet-400" size={18} />
                                  <span className="font-semibold text-white">
                                    Departments ({circular.departmentWiseRequirements.length})
                                  </span>
                                </div>
                                <div className="grid md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                  {circular.departmentWiseRequirements.map((dept, idx) => (
                                    <div 
                                      key={idx} 
                                      className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30"
                                    >
                                      <p className="font-medium text-white text-sm mb-1">{dept.departmentName}</p>
                                      <div className="flex items-center gap-3 text-xs text-slate-400">
                                        {dept.minGpaSSC && (
                                          <span>SSC: {dept.minGpaSSC}</span>
                                        )}
                                        {dept.minGpaHSC && (
                                          <span>HSC: {dept.minGpaHSC}</span>
                                        )}
                                        {dept.minGpaTotal && (
                                          <span>Total: {dept.minGpaTotal}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Contact & Links */}
                            <div className="flex flex-wrap items-center gap-4">
                              {circular.circularLink && (
                                <a
                                  href={circular.circularLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                  <ExternalLink size={16} />
                                  View Official Circular
                                </a>
                              )}
                              {circular.contactEmail && (
                                <a
                                  href={`mailto:${circular.contactEmail}`}
                                  className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                                >
                                  <Mail size={16} />
                                  {circular.contactEmail}
                                </a>
                              )}
                              {circular.contactPhone && (
                                <a
                                  href={`tel:${circular.contactPhone}`}
                                  className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                                >
                                  <Phone size={16} />
                                  {circular.contactPhone}
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && studentProfile && (
            <div className={`space-y-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 backdrop-blur-sm rounded-2xl p-6 border border-violet-500/30">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/25">
                    <span className="text-4xl font-bold text-white">
                      {(studentProfile.candidate_name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {studentProfile.candidate_name || 'Student'}
                    </h2>
                    <p className="text-slate-400 mb-3">
                      {studentProfile.email || user?.email}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      {studentProfile.ssc_gpa && studentProfile.hsc_gpa && (
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium">
                          Total GPA: {(parseFloat(studentProfile.ssc_gpa) + parseFloat(studentProfile.hsc_gpa)).toFixed(2)}
                        </span>
                      )}
                      {studentProfile.nationality && (
                        <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm">
                          {studentProfile.nationality}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/register')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20"
                  >
                    <Edit size={18} />
                    Edit Profile
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Academic Information */}
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                  <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <GraduationCap className="text-violet-400" size={22} />
                    Academic Information
                  </h3>
                  
                  <div className="space-y-4">
                    {/* SSC */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-white flex items-center gap-2">
                          <School className="text-violet-400" size={18} />
                          SSC Details
                        </span>
                        {studentProfile.ssc_gpa && (
                          <span className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-lg font-bold">
                            GPA: {studentProfile.ssc_gpa}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {studentProfile.ssc_roll && (
                          <div>
                            <p className="text-slate-500">Roll</p>
                            <p className="text-slate-200 font-medium">{studentProfile.ssc_roll}</p>
                          </div>
                        )}
                        {studentProfile.ssc_registration && (
                          <div>
                            <p className="text-slate-500">Registration</p>
                            <p className="text-slate-200 font-medium">{studentProfile.ssc_registration}</p>
                          </div>
                        )}
                        {studentProfile.ssc_year && (
                          <div>
                            <p className="text-slate-500">Year</p>
                            <p className="text-slate-200 font-medium">{studentProfile.ssc_year}</p>
                          </div>
                        )}
                        {studentProfile.ssc_board && (
                          <div>
                            <p className="text-slate-500">Board</p>
                            <p className="text-slate-200 font-medium">{studentProfile.ssc_board}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* HSC */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-white flex items-center gap-2">
                          <School className="text-cyan-400" size={18} />
                          HSC Details
                        </span>
                        {studentProfile.hsc_gpa && (
                          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg font-bold">
                            GPA: {studentProfile.hsc_gpa}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {studentProfile.hsc_roll && (
                          <div>
                            <p className="text-slate-500">Roll</p>
                            <p className="text-slate-200 font-medium">{studentProfile.hsc_roll}</p>
                          </div>
                        )}
                        {studentProfile.hsc_registration && (
                          <div>
                            <p className="text-slate-500">Registration</p>
                            <p className="text-slate-200 font-medium">{studentProfile.hsc_registration}</p>
                          </div>
                        )}
                        {studentProfile.hsc_year && (
                          <div>
                            <p className="text-slate-500">Year</p>
                            <p className="text-slate-200 font-medium">{studentProfile.hsc_year}</p>
                          </div>
                        )}
                        {studentProfile.hsc_board && (
                          <div>
                            <p className="text-slate-500">Board</p>
                            <p className="text-slate-200 font-medium">{studentProfile.hsc_board}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {studentProfile.applied_faculty && (
                      <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-xl p-4 border border-violet-500/20">
                        <p className="text-slate-400 text-sm mb-1">Applied Faculty / Program</p>
                        <p className="text-white font-semibold">{studentProfile.applied_faculty}</p>
                        {studentProfile.applied_program && (
                          <p className="text-violet-400 text-sm mt-1">{studentProfile.applied_program}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Personal & Contact */}
            <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                      <User className="text-emerald-400" size={22} />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {studentProfile.candidate_name && (
                        <div className="col-span-2">
                          <p className="text-slate-500">Full Name</p>
                          <p className="text-slate-200 font-medium">{studentProfile.candidate_name}</p>
                        </div>
                      )}
                      {studentProfile.father_name && (
                        <div>
                          <p className="text-slate-500">Father's Name</p>
                          <p className="text-slate-200 font-medium">{studentProfile.father_name}</p>
                        </div>
                      )}
                      {studentProfile.mother_name && (
                        <div>
                          <p className="text-slate-500">Mother's Name</p>
                          <p className="text-slate-200 font-medium">{studentProfile.mother_name}</p>
                        </div>
                      )}
                      {studentProfile.date_of_birth && (
                        <div>
                          <p className="text-slate-500">Date of Birth</p>
                          <p className="text-slate-200 font-medium">
                            {new Date(studentProfile.date_of_birth).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {studentProfile.gender && (
                        <div>
                          <p className="text-slate-500">Gender</p>
                          <p className="text-slate-200 font-medium">{studentProfile.gender}</p>
                        </div>
                      )}
                      {studentProfile.nationality && (
                        <div>
                          <p className="text-slate-500">Nationality</p>
                          <p className="text-slate-200 font-medium">{studentProfile.nationality}</p>
                        </div>
                      )}
                      {studentProfile.religion && (
                        <div>
                          <p className="text-slate-500">Religion</p>
                          <p className="text-slate-200 font-medium">{studentProfile.religion}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                      <Phone className="text-cyan-400" size={22} />
                      Contact Information
                    </h3>
                    
                    <div className="space-y-3">
                      {studentProfile.mobile_number && (
                        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
                          <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                            <Phone className="text-cyan-400" size={18} />
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Mobile</p>
                            <p className="text-slate-200 font-medium">{studentProfile.mobile_number}</p>
                          </div>
                        </div>
                      )}
                      {studentProfile.email && (
                        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
                          <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                            <Mail className="text-violet-400" size={18} />
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Email</p>
                            <p className="text-slate-200 font-medium">{studentProfile.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              {(studentProfile.present_division || studentProfile.present_district) && (
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                  <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <MapPin className="text-rose-400" size={22} />
                    Address Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Present Address */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <Globe className="text-emerald-400" size={16} />
                        Present Address
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {studentProfile.present_division && (
                          <div>
                            <p className="text-slate-500">Division</p>
                            <p className="text-slate-200">{studentProfile.present_division}</p>
                          </div>
                        )}
                        {studentProfile.present_district && (
                          <div>
                            <p className="text-slate-500">District</p>
                            <p className="text-slate-200">{studentProfile.present_district}</p>
                          </div>
                        )}
                        {studentProfile.present_thana && (
                          <div>
                            <p className="text-slate-500">Thana</p>
                            <p className="text-slate-200">{studentProfile.present_thana}</p>
                          </div>
                        )}
                        {studentProfile.present_post_office && (
                          <div>
                            <p className="text-slate-500">Post Office</p>
                            <p className="text-slate-200">{studentProfile.present_post_office}</p>
                          </div>
                        )}
                        {studentProfile.present_village && (
                          <div>
                            <p className="text-slate-500">Village</p>
                            <p className="text-slate-200">{studentProfile.present_village}</p>
                          </div>
                        )}
                        {studentProfile.present_zip_code && (
                          <div>
                            <p className="text-slate-500">ZIP Code</p>
                            <p className="text-slate-200">{studentProfile.present_zip_code}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Permanent Address */}
                    {!studentProfile.same_as_present_address && (studentProfile.permanent_division || studentProfile.permanent_district) && (
                      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <MapPin className="text-rose-400" size={16} />
                          Permanent Address
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {studentProfile.permanent_division && (
                            <div>
                              <p className="text-slate-500">Division</p>
                              <p className="text-slate-200">{studentProfile.permanent_division}</p>
                            </div>
                          )}
                          {studentProfile.permanent_district && (
                            <div>
                              <p className="text-slate-500">District</p>
                              <p className="text-slate-200">{studentProfile.permanent_district}</p>
                            </div>
                          )}
                          {studentProfile.permanent_thana && (
                            <div>
                              <p className="text-slate-500">Thana</p>
                              <p className="text-slate-200">{studentProfile.permanent_thana}</p>
                            </div>
                          )}
                          {studentProfile.permanent_post_office && (
                            <div>
                              <p className="text-slate-500">Post Office</p>
                              <p className="text-slate-200">{studentProfile.permanent_post_office}</p>
                            </div>
                          )}
                          {studentProfile.permanent_village && (
                            <div>
                              <p className="text-slate-500">Village</p>
                              <p className="text-slate-200">{studentProfile.permanent_village}</p>
                            </div>
                          )}
                          {studentProfile.permanent_zip_code && (
                            <div>
                              <p className="text-slate-500">ZIP Code</p>
                              <p className="text-slate-200">{studentProfile.permanent_zip_code}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {studentProfile.same_as_present_address && (
                      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">
                          Permanent address same as present address
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
