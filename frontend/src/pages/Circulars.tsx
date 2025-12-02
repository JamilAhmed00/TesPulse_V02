import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search } from 'lucide-react';
import Header from '../components/Header';
import CircularCard from '../components/CircularCard';
import { authStorage, applicationStorage } from '../lib/storage.ts';
import { mockUniversitiesFull } from '../lib/mockData';
import { Application } from '../lib/supabase';

type FilterType = 'all' | 'new' | 'applied' | 'closed';

export default function Circulars() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authStorage.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = () => {
      try {
        setApplications(applicationStorage.getApplications());
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleAddToList = (universityId: string) => {
    navigate(`/applications?university=${universityId}`);
  };

  const filteredUniversities = useMemo(() => {
    let filtered = mockUniversitiesFull;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(uni =>
        uni.name.toLowerCase().includes(query) ||
        uni.city.toLowerCase().includes(query) ||
        uni.description.toLowerCase().includes(query)
      );
    }

    if (filter === 'applied') {
      filtered = filtered.filter(uni =>
        applications.some(app => app.university_id === uni.id)
      );
    } else if (filter === 'closed') {
      filtered = filtered.filter(uni => {
        const deadline = new Date(uni.deadline);
        return deadline.getTime() < Date.now();
      });
    } else if (filter === 'new') {
      filtered = filtered.filter(uni => {
        const deadline = new Date(uni.deadline);
        const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil > 7 && !applications.some(app => app.university_id === uni.id);
      });
    }

    return filtered.sort((a, b) => {
      const deadlineA = new Date(a.deadline).getTime();
      const deadlineB = new Date(b.deadline).getTime();
      return deadlineA - deadlineB;
    });
  }, [searchQuery, filter, applications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] pt-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Loading circulars...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Header />

      <div className="relative z-10 py-8 pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl shadow-lg shadow-violet-500/25">
                <FileText className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">University Circulars</h1>
                <p className="text-slate-400">
                  Browse all admission circulars and guidelines
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Search universities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                {[
                  { value: 'all' as FilterType, label: 'All', count: mockUniversitiesFull.length },
                  { value: 'new' as FilterType, label: 'New', count: mockUniversitiesFull.filter(uni => {
                    const deadline = new Date(uni.deadline);
                    const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return daysUntil > 7 && !applications.some(app => app.university_id === uni.id);
                  }).length },
                  { value: 'applied' as FilterType, label: 'Applied', count: applications.length },
                  { value: 'closed' as FilterType, label: 'Closed', count: mockUniversitiesFull.filter(uni => {
                    const deadline = new Date(uni.deadline);
                    return deadline.getTime() < Date.now();
                  }).length },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      filter === option.value
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-2 border-slate-700'
                    }`}
                  >
                    {option.label}
                    {option.count > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        filter === option.value
                          ? 'bg-white/20 text-white'
                          : 'bg-violet-500/20 text-violet-400'
                      }`}>
                        {option.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Circulars Grid */}
          {filteredUniversities.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-12 border-2 border-slate-700 text-center">
              <FileText className="text-slate-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-300 mb-2">No circulars found</h3>
              <p className="text-slate-500">
                {searchQuery 
                  ? `No universities match "${searchQuery}". Try a different search term.`
                  : 'No circulars match the selected filter.'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredUniversities.map((university) => {
                const application = applications.find(app => app.university_id === university.id);
                return (
                  <CircularCard
                    key={university.id}
                    university={university}
                    application={application || null}
                    onAddToList={() => handleAddToList(university.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
