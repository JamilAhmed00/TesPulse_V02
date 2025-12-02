import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useSignup } from '../hooks/api/auth';
import { useCreateStudent, useFetchEducationBoardResult } from '../hooks/api/students';
import { userAtom } from '../store/auth';
import Header from '../components/Header';
import { ChevronRight, ChevronLeft, Mail, Lock, GraduationCap, User, Phone, MapPin, Loader, CheckCircle, AlertCircle } from 'lucide-react';

type RegistrationStep = 'auth' | 'academic' | 'personal' | 'contact' | 'present-address' | 'permanent-address' | 'complete';

// Education boards in Bangladesh
const EDUCATION_BOARDS = [
  'Dhaka',
  'Chittagong',
  'Rajshahi',
  'Comilla',
  'Jessore',
  'Barisal',
  'Sylhet',
  'Dinajpur',
  'Mymensingh',
  'Madrasah',
  'Technical',
  'DIBS (Dhaka)',
];

// Generate last 6 years (current year and 5 previous years)
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 6; i++) {
    years.push((currentYear - i).toString());
  }
  return years;
};

const YEAR_OPTIONS = getYearOptions();

export default function RegistrationFlow() {
  const navigate = useNavigate();
  const user = useAtomValue(userAtom);
  const signupMutation = useSignup();
  const createStudentMutation = useCreateStudent();
  const fetchSSCResult = useFetchEducationBoardResult();
  const fetchHSCResult = useFetchEducationBoardResult();
  const [step, setStep] = useState<RegistrationStep>(user ? 'academic' : 'auth');
  const [error, setError] = useState('');
  const [fetchingResults, setFetchingResults] = useState(false);
  const [fetchResultsError, setFetchResultsError] = useState('');
  const [resultsFetched, setResultsFetched] = useState(false);

  // Form state
  const [auth, setAuth] = useState({ email: '', password: '', full_name: '' });

  const [academic, setAcademic] = useState({
    ssc_roll: '',
    ssc_registration: '',
    ssc_year: '',
    ssc_board: '',
    ssc_gpa: '',
    hsc_roll: '',
    hsc_registration: '',
    hsc_year: '',
    hsc_board: '',
    hsc_gpa: '',
    applied_faculty: '',
    applied_program: '',
  });

  const [personal, setPersonal] = useState({
    candidate_name: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    religion: '',
    nid_or_birth_certificate: '',
  });

  const [contact, setContact] = useState({
    mobile_number: '',
    email: '',
  });

  const [presentAddress, setPresentAddress] = useState({
    division: '',
    district: '',
    thana: '',
    post_office: '',
    village: '',
    zip_code: '',
  });

  const [permanentAddress, setPermanentAddress] = useState({
    same_as_present: true,
    division: '',
    district: '',
    thana: '',
    post_office: '',
    village: '',
    zip_code: '',
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!auth.email || !auth.password || !auth.full_name) {
      setError('Email, password, and full name are required');
      return;
    }

    signupMutation.mutate(
      {
        email: auth.email,
        password: auth.password,
        full_name: auth.full_name,
        role: 'student',
      },
      {
        onSuccess: () => {
          setContact({ ...contact, email: auth.email });
          setStep('academic');
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { detail?: string } } };
          setError(error?.response?.data?.detail || 'Failed to create account');
        },
      }
    );
  };

  const handleFetchResults = async () => {
    setError('');
    setFetchResultsError('');
    setFetchingResults(true);
    setResultsFetched(false);

    // Validate required fields
    if (!academic.ssc_roll || !academic.ssc_year || !academic.ssc_board ||
        !academic.hsc_roll || !academic.hsc_registration || !academic.hsc_year || !academic.hsc_board) {
      setFetchResultsError('Please fill all academic credential fields before fetching results');
      setFetchingResults(false);
      return;
    }

    try {
      // Fetch SSC results
      const sscResult = await fetchSSCResult.mutateAsync({
        examination: 'SSC',
        year: academic.ssc_year,
        board: academic.ssc_board,
        roll: academic.ssc_roll,
        registration: academic.ssc_registration || '',
      });

      // Fetch HSC results
      const hscResult = await fetchHSCResult.mutateAsync({
        examination: 'HSC',
        year: academic.hsc_year,
        board: academic.hsc_board,
        roll: academic.hsc_roll,
        registration: academic.hsc_registration,
      });

      // Auto-populate fields
      if (sscResult.success) {
        if (sscResult.gpa) {
          setAcademic(prev => ({ ...prev, ssc_gpa: sscResult.gpa || '' }));
        }
        // Father's and mother's names are not auto-populated (manual entry only)
        // if (sscResult.father_name && !personal.father_name) {
        //   setPersonal(prev => ({ ...prev, father_name: sscResult.father_name || '' }));
        // }
        // if (sscResult.mother_name && !personal.mother_name) {
        //   setPersonal(prev => ({ ...prev, mother_name: sscResult.mother_name || '' }));
        // }
        // Student name is not auto-populated (manual entry only)
        // if (sscResult.student_name && !personal.candidate_name) {
        //   setPersonal(prev => ({ ...prev, candidate_name: sscResult.student_name || '' }));
        // }
      }

      if (hscResult.success) {
        if (hscResult.gpa) {
          setAcademic(prev => ({ ...prev, hsc_gpa: hscResult.gpa || '' }));
        }
        // Use HSC data if SSC didn't provide it
        // Father's and mother's names are not auto-populated (manual entry only)
        // if (hscResult.father_name && !personal.father_name) {
        //   setPersonal(prev => ({ ...prev, father_name: hscResult.father_name || '' }));
        // }
        // if (hscResult.mother_name && !personal.mother_name) {
        //   setPersonal(prev => ({ ...prev, mother_name: hscResult.mother_name || '' }));
        // }
        // Student name is not auto-populated (manual entry only)
        // if (hscResult.student_name && !personal.candidate_name) {
        //   setPersonal(prev => ({ ...prev, candidate_name: hscResult.student_name || '' }));
        // }
      }

      // Check for errors
      const errors: string[] = [];
      if (!sscResult.success && sscResult.error) {
        errors.push(`SSC: ${sscResult.error}`);
      }
      if (!hscResult.success && hscResult.error) {
        errors.push(`HSC: ${hscResult.error}`);
      }

      if (errors.length > 0) {
        setFetchResultsError(errors.join(' | '));
      } else {
        setResultsFetched(true);
      }
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      setFetchResultsError(error?.response?.data?.detail || 'Failed to fetch results. Please try again.');
    } finally {
      setFetchingResults(false);
    }
  };

  const handleNext = async () => {
    setError('');

    // Validation for each step
    if (step === 'academic') {
      if (!academic.ssc_roll || !academic.ssc_year || !academic.ssc_board ||
          !academic.hsc_roll || !academic.hsc_registration || !academic.hsc_year || !academic.hsc_board) {
        setError('Please fill all academic credential fields');
        return;
      }
      
      // Auto-fetch results if not already fetched
      if (!resultsFetched && !fetchingResults) {
        await handleFetchResults();
      }
      
      // Proceed to next step
      setStep('personal');
    } else if (step === 'personal') {
      if (!personal.candidate_name || !personal.father_name || !personal.mother_name ||
          !personal.date_of_birth || !personal.gender || !personal.nationality) {
        setError('Please fill all required personal information fields');
        return;
      }
      setStep('contact');
    } else if (step === 'contact') {
      if (!contact.mobile_number || !contact.email) {
        setError('Please provide mobile number and email');
        return;
      }
      setStep('present-address');
    } else if (step === 'present-address') {
      if (!presentAddress.division || !presentAddress.district || !presentAddress.thana ||
          !presentAddress.village || !presentAddress.zip_code) {
        setError('Please fill all present address fields');
        return;
      }
      setStep('permanent-address');
    } else if (step === 'permanent-address') {
      if (!permanentAddress.same_as_present) {
        if (!permanentAddress.division || !permanentAddress.district || !permanentAddress.thana ||
            !permanentAddress.village || !permanentAddress.zip_code) {
          setError('Please fill all permanent address fields or select "Same as Present"');
          return;
        }
      }
      handleComplete();
    }
  };

  const handleBack = () => {
    setError('');
    if (step === 'academic') {
      setStep('auth');
    } else if (step === 'personal') {
      setStep('academic');
    } else if (step === 'contact') {
      setStep('personal');
    } else if (step === 'present-address') {
      setStep('contact');
    } else if (step === 'permanent-address') {
      setStep('present-address');
    }
  };

  const handleComplete = () => {
    setError('');

    if (!user) {
      setError('Not authenticated');
      return;
    }

    // Prepare permanent address data
    const permanentAddr = permanentAddress.same_as_present ? presentAddress : permanentAddress;

    createStudentMutation.mutate(
      {
        // Academic Information
        ssc_roll: academic.ssc_roll,
        ssc_registration: academic.ssc_registration,
        ssc_year: academic.ssc_year,
        ssc_board: academic.ssc_board,
        ssc_gpa: academic.ssc_gpa || undefined,
        hsc_roll: academic.hsc_roll,
        hsc_registration: academic.hsc_registration,
        hsc_year: academic.hsc_year,
        hsc_board: academic.hsc_board,
        hsc_gpa: academic.hsc_gpa || undefined,
        applied_faculty: academic.applied_faculty,
        applied_program: academic.applied_program,
        
        // Personal Information
        candidate_name: personal.candidate_name,
        father_name: personal.father_name,
        mother_name: personal.mother_name,
        full_name: personal.candidate_name || user.full_name,
        date_of_birth: personal.date_of_birth || undefined,
        gender: personal.gender,
        nationality: personal.nationality,
        religion: personal.religion,
        nid_or_birth_certificate: personal.nid_or_birth_certificate,
        
        // Contact Information
        email: contact.email || user.email,
        mobile_number: contact.mobile_number,
        phone: contact.mobile_number,
        
        // Present Address
        present_division: presentAddress.division,
        present_district: presentAddress.district,
        present_thana: presentAddress.thana,
        present_post_office: presentAddress.post_office,
        present_village: presentAddress.village,
        present_zip_code: presentAddress.zip_code,
        
        // Permanent Address
        same_as_present_address: permanentAddress.same_as_present,
        permanent_division: permanentAddr.division,
        permanent_district: permanentAddr.district,
        permanent_thana: permanentAddr.thana,
        permanent_post_office: permanentAddr.post_office,
        permanent_village: permanentAddr.village,
        permanent_zip_code: permanentAddr.zip_code,
      },
      {
        onSuccess: () => {
      setStep('complete');
      setTimeout(() => navigate('/dashboard'), 2000);
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { detail?: string } } };
          setError(error?.response?.data?.detail || 'Failed to complete registration');
        },
      }
    );
  };

  const renderStep = () => {
    switch (step) {
      case 'auth':
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white">Create Your Account</h2>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-500" size={20} />
                  <input
                    type="text"
                    value={auth.full_name}
                    onChange={(e) => setAuth({ ...auth, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="Your Full Name"
                    required
                    disabled={signupMutation.isPending}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={auth.email}
                    onChange={(e) => setAuth({ ...auth, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="your@email.com"
                    required
                    disabled={signupMutation.isPending}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input
                    type="password"
                    value={auth.password}
                    onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={signupMutation.isPending}
                  />
                </div>
              </div>
              {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-violet-500/30"
              >
                {signupMutation.isPending ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        );

      case 'academic':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="text-violet-400" size={32} />
              <div>
                <h2 className="text-3xl font-bold text-white">Academic Information</h2>
                <p className="text-slate-400">Enter your SSC and HSC examination details</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* SSC Details */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">SSC Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">SSC Roll Number *</label>
                <input
                  type="text"
                      value={academic.ssc_roll}
                      onChange={(e) => setAcademic({ ...academic, ssc_roll: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                      placeholder="116735"
                      required
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">SSC Registration</label>
                <input
                  type="text"
                      value={academic.ssc_registration}
                      onChange={(e) => setAcademic({ ...academic, ssc_registration: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                      placeholder="2014614701"
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">SSC Passing Year *</label>
                <select
                  value={academic.ssc_year}
                      onChange={(e) => setAcademic({ ...academic, ssc_year: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                      required
                >
                  <option value="">Select Year</option>
                  {YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">SSC Board *</label>
                <select
                      value={academic.ssc_board}
                      onChange={(e) => setAcademic({ ...academic, ssc_board: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                      required
                >
                  <option value="">Select Board</option>
                  {EDUCATION_BOARDS.map((board) => (
                    <option key={board} value={board}>
                      {board}
                    </option>
                  ))}
                </select>
                  </div>
                </div>
              </div>

              {/* HSC Details */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">HSC Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">HSC Roll Number *</label>
                <input
                      type="text"
                      value={academic.hsc_roll}
                      onChange={(e) => setAcademic({ ...academic, hsc_roll: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                      placeholder="120606"
                      required
                />
              </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">HSC Registration *</label>
                <input
                  type="text"
                      value={academic.hsc_registration}
                      onChange={(e) => setAcademic({ ...academic, hsc_registration: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                      placeholder="2014614701"
                      required
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">HSC Passing Year *</label>
                <select
                  value={academic.hsc_year}
                      onChange={(e) => setAcademic({ ...academic, hsc_year: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                      required
                >
                  <option value="">Select Year</option>
                  {YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">HSC Board *</label>
                <select
                      value={academic.hsc_board}
                      onChange={(e) => setAcademic({ ...academic, hsc_board: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                      required
                >
                  <option value="">Select Board</option>
                  {EDUCATION_BOARDS.map((board) => (
                    <option key={board} value={board}>
                      {board}
                    </option>
                  ))}
                </select>
                  </div>
                </div>
              </div>

              {/* Applied Faculty/Program */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Applied Faculty / Program</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Faculty</label>
                <input
                      type="text"
                      value={academic.applied_faculty}
                      onChange={(e) => setAcademic({ ...academic, applied_faculty: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                      placeholder="Bachelor of Business Administration (General)"
                />
              </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Program</label>
                <input
                  type="text"
                      value={academic.applied_program}
                      onChange={(e) => setAcademic({ ...academic, applied_program: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                      placeholder="General"
                />
                  </div>
                </div>
              </div>

              {/* GPA Display (if fetched) */}
              {(academic.ssc_gpa || academic.hsc_gpa) && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Fetched Results</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {academic.ssc_gpa && (
                      <div>
                        <span className="text-sm font-medium text-green-800">SSC GPA:</span>
                        <span className="ml-2 text-lg font-bold text-green-900">{academic.ssc_gpa}</span>
                      </div>
                    )}
                    {academic.hsc_gpa && (
                      <div>
                        <span className="text-sm font-medium text-green-800">HSC GPA:</span>
                        <span className="ml-2 text-lg font-bold text-green-900">{academic.hsc_gpa}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fetch Results Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Fetch Results from Education Board</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Automatically fetch your GPA and parent information
                    </p>
                  </div>
                  <button
                    onClick={handleFetchResults}
                    disabled={fetchingResults || !academic.ssc_roll || !academic.ssc_year || !academic.ssc_board || !academic.hsc_roll || !academic.hsc_registration || !academic.hsc_year || !academic.hsc_board}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30"
                  >
                    {fetchingResults ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Fetch Results
                      </>
                    )}
                  </button>
                </div>

                {fetchingResults && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Loader className="animate-spin text-violet-400" size={24} />
                      <div>
                        <p className="font-medium text-blue-900">Fetching results from Education Board...</p>
                        <p className="text-sm text-blue-700">This may take a few moments</p>
                      </div>
                    </div>
                  </div>
                )}

                {resultsFetched && !fetchingResults && (
                  <div className="mt-4 p-4 bg-emerald-500/20 border border-green-300 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-emerald-400" size={24} />
                      <div>
                        <p className="font-medium text-green-900">Results fetched successfully!</p>
                        <p className="text-sm text-green-700">GPA and parent information have been auto-populated</p>
                      </div>
                    </div>
                  </div>
                )}

                {fetchResultsError && !fetchingResults && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="text-red-600" size={24} />
                      <div>
                        <p className="font-medium text-red-900">Error fetching results</p>
                        <p className="text-sm text-red-700">{fetchResultsError}</p>
                        <p className="text-xs text-red-600 mt-1">You can still proceed and enter information manually</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4">{error}</div>}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800/50 transition-colors"
              >
                <ChevronLeft size={20} /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={fetchingResults}
                className="flex items-center gap-2 px-6 py-3 ml-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-violet-500/30 transition-all"
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-violet-400" size={32} />
              <div>
                <h2 className="text-3xl font-bold text-white">Personal Information</h2>
                <p className="text-slate-400">Tell us about yourself</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Candidate Name *</label>
                  <input
                    type="text"
                    value={personal.candidate_name}
                    onChange={(e) => setPersonal({ ...personal, candidate_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="MD FAHMID TALUKDER"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    value={personal.date_of_birth}
                    onChange={(e) => setPersonal({ ...personal, date_of_birth: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Father's Name *</label>
                  <input
                    type="text"
                    value={personal.father_name}
                    onChange={(e) => setPersonal({ ...personal, father_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="MD HELAL UDDIN TALUKDER"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mother's Name *</label>
                  <input
                    type="text"
                    value={personal.mother_name}
                    onChange={(e) => setPersonal({ ...personal, mother_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="UMMA SALMA BEGUM"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Gender *</label>
                  <select
                    value={personal.gender}
                    onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nationality *</label>
                  <input
                    type="text"
                    value={personal.nationality}
                    onChange={(e) => setPersonal({ ...personal, nationality: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="Bangladeshi"
                    required
                  />
                </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Religion</label>
                  <input
                    type="text"
                    value={personal.religion}
                    onChange={(e) => setPersonal({ ...personal, religion: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="ISLAM"
                  />
                  </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">NID / Birth Certificate</label>
                  <input
                    type="text"
                    value={personal.nid_or_birth_certificate}
                    onChange={(e) => setPersonal({ ...personal, nid_or_birth_certificate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
            
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4">{error}</div>}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800/50 transition-colors"
              >
                <ChevronLeft size={20} /> Back
              </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 ml-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl shadow-lg shadow-violet-500/30 transition-all"
                >
                Next <ChevronRight size={20} />
                </button>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Phone className="text-violet-400" size={32} />
              <div>
                <h2 className="text-3xl font-bold text-white">Contact Information</h2>
                <p className="text-slate-400">How can we reach you?</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mobile Number *</label>
                <input
                  type="tel"
                  value={contact.mobile_number}
                  onChange={(e) => setContact({ ...contact, mobile_number: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                  placeholder="01614742727"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                  placeholder="jamilahmediiuc@gmail.com"
                  required
                />
              </div>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4">{error}</div>}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800/50 transition-colors"
              >
                <ChevronLeft size={20} /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 ml-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl shadow-lg shadow-violet-500/30 transition-all"
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          </div>
        );

      case 'present-address':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="text-violet-400" size={32} />
              <div>
                <h2 className="text-3xl font-bold text-white">Present Address</h2>
                <p className="text-slate-400">Your current address</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Division *</label>
                <input
                  type="text"
                  value={presentAddress.division}
                  onChange={(e) => setPresentAddress({ ...presentAddress, division: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                  placeholder="CHATTAGRAM"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">District *</label>
                <input
                  type="text"
                  value={presentAddress.district}
                  onChange={(e) => setPresentAddress({ ...presentAddress, district: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                  placeholder="CHATTAGRAM"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Thana *</label>
                <input
                  type="text"
                  value={presentAddress.thana}
                  onChange={(e) => setPresentAddress({ ...presentAddress, thana: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                  placeholder="PORT"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Post Office</label>
                <input
                  type="text"
                  value={presentAddress.post_office}
                  onChange={(e) => setPresentAddress({ ...presentAddress, post_office: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Village *</label>
                <input
                  type="text"
                  value={presentAddress.village}
                  onChange={(e) => setPresentAddress({ ...presentAddress, village: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                  placeholder="CHATTAGRAM"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">ZIP Code *</label>
                <input
                  type="text"
                  value={presentAddress.zip_code}
                  onChange={(e) => setPresentAddress({ ...presentAddress, zip_code: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                  placeholder="3321"
                  required
                />
              </div>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4">{error}</div>}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800/50 transition-colors"
              >
                <ChevronLeft size={20} /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 ml-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl shadow-lg shadow-violet-500/30 transition-all"
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          </div>
        );

      case 'permanent-address':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="text-violet-400" size={32} />
              <div>
                <h2 className="text-3xl font-bold text-white">Permanent Address</h2>
                <p className="text-slate-400">Your permanent address</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permanentAddress.same_as_present}
                  onChange={(e) => {
                    setPermanentAddress({ ...permanentAddress, same_as_present: e.target.checked });
                  }}
                  className="w-5 h-5 text-violet-400 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-slate-300 font-medium">Same as Present Address</span>
              </label>
            </div>

            {!permanentAddress.same_as_present && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Division *</label>
                  <input
                    type="text"
                    value={permanentAddress.division}
                    onChange={(e) => setPermanentAddress({ ...permanentAddress, division: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="CHATTAGRAM"
                    required={!permanentAddress.same_as_present}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">District *</label>
                  <input
                    type="text"
                    value={permanentAddress.district}
                    onChange={(e) => setPermanentAddress({ ...permanentAddress, district: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="CHATTAGRAM"
                    required={!permanentAddress.same_as_present}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Thana *</label>
                  <input
                    type="text"
                    value={permanentAddress.thana}
                    onChange={(e) => setPermanentAddress({ ...permanentAddress, thana: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="PORT"
                    required={!permanentAddress.same_as_present}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Post Office</label>
                  <input
                    type="text"
                    value={permanentAddress.post_office}
                    onChange={(e) => setPermanentAddress({ ...permanentAddress, post_office: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Village *</label>
                  <input
                    type="text"
                    value={permanentAddress.village}
                    onChange={(e) => setPermanentAddress({ ...permanentAddress, village: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="CHATTAGRAM"
                    required={!permanentAddress.same_as_present}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={permanentAddress.zip_code}
                    onChange={(e) => setPermanentAddress({ ...permanentAddress, zip_code: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    placeholder="3321"
                    required={!permanentAddress.same_as_present}
                  />
                </div>
              </div>
            )}

            {permanentAddress.same_as_present && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
                <p className="font-medium">Using present address as permanent address</p>
              </div>
            )}

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4">{error}</div>}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800/50 transition-colors"
              >
                <ChevronLeft size={20} /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={createStudentMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 ml-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-violet-500/30 transition-all"
              >
                {createStudentMutation.isPending ? 'Completing...' : 'Complete Registration'} <ChevronRight size={20} />
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Registration Complete!</h2>
            <p className="text-slate-400 mb-8">Welcome to TestPulse! Your student profile has been created successfully.</p>
            <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
          </div>
        );
    }
  };

  const steps = ['auth', 'academic', 'personal', 'contact', 'present-address', 'permanent-address'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <Header />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {step !== 'complete' && (
          <div className="mb-12">
            <div className="flex justify-between mb-4 gap-2">
              {steps.map((s, idx) => (
              <div
                key={s}
                  className={`h-2 flex-1 rounded-full transition ${
                    currentStepIndex >= idx
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600'
                    : 'bg-slate-700'
                }`}
              ></div>
            ))}
            </div>
            <div className="text-center text-sm text-slate-400">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>
        )}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">{renderStep()}</div>
      </div>
    </div>
  );
}
