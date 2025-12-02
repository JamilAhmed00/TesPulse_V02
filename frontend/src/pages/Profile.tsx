import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentStorage, authStorage } from '../lib/storage.ts';
import { Edit2, Save, X } from 'lucide-react';
import Header from '../components/Header';

export default function Profile() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = () => {
      try {
        const currentUser = authStorage.getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        const studentData = studentStorage.getStudent();
        if (!studentData) {
          navigate('/register');
          return;
        }

        if (studentData) {
          setStudent(studentData);
          setFormData(studentData);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleSave = () => {
    setSaving(true);
    try {
      const updated = studentStorage.updateStudent(formData);
      if (updated) {
        setStudent(updated);
        setEditing(false);
      }
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] pt-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] pt-20">
          <div className="text-center">
            <p className="text-xl text-slate-400 mb-4">Profile not found</p>
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Personal Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-2 px-4 rounded-lg transition shadow-lg shadow-violet-500/30"
              >
                <Edit2 size={20} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData(student);
                    setEditing(false);
                  }}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition"
                >
                  <X size={20} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  <Save size={20} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {editing && (
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 mb-8">
              <p className="text-sm text-violet-300">You are now editing your profile. Make changes and click Save to update.</p>
            </div>
          )}

          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-slate-700">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.first_name || ''}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white font-medium">{student.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.last_name || ''}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white font-medium">{student.last_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Father's Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.father_name || ''}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white font-medium">{student.father_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mother's Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.mother_name || ''}
                      onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white font-medium">{student.mother_name}</p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-slate-700">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white font-medium">{student.email}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mobile Number</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.mobile_number || ''}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white font-medium">{student.mobile_number}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white font-medium">{student.address}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white font-medium">{student.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Unit</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.unit || ''}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white font-medium">{student.unit}</p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-slate-700">Academic Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">SSC Roll</label>
                  <p className="text-white font-medium">{student.ssc_roll}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">SSC Year</label>
                  <p className="text-white font-medium">{student.ssc_year}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">SSC Board</label>
                  <p className="text-white font-medium">{student.ssc_board}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">HSC Roll</label>
                  <p className="text-white font-medium">{student.hsc_roll}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">HSC Year</label>
                  <p className="text-white font-medium">{student.hsc_year}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">HSC Board</label>
                  <p className="text-white font-medium">{student.hsc_board}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">HSC Registration Number</label>
                  <p className="text-white font-medium">{student.hsc_registration_number}</p>
                </div>
              </div>
            </section>

            <section className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email (Account)</label>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Registration Date</label>
                  <p className="text-white font-medium">
                    {new Date(student.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
