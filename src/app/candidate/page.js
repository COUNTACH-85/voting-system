'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CandidateDashboard() {
  const [user, setUser] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: '', party: '', imageUrl: '' });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== 'candidate') {
        router.push('/');
        return;
      }
      setUser(user);
      fetchCandidateData(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  }, [router]);

  const fetchCandidateData = async (userObj) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/candidates');
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      const data = await response.json();
      setCandidates(data.candidates);
      // Find the candidate record for this user
      const userCandidate = data.candidates.find(c => c.userId === (userObj?.id || user?.id));
      if (userCandidate) {
        setCandidate(userCandidate);
        setShowApplyForm(false);
      } else {
        setShowApplyForm(true);
      }
    } catch (error) {
      setError('Failed to load candidate data');
      console.error('Error fetching candidate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleApplyChange = (e) => {
    const { name, value } = e.target;
    setApplyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: applyForm.name,
          party: applyForm.party,
          imageUrl: applyForm.imageUrl,
          userId: user.id
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply for candidature');
      }
      // Refresh candidate data
      await fetchCandidateData(user);
    } catch (error) {
      setApplyError(error.message);
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Dashboard</h1>
          <p className="text-gray-600">View your campaign progress and vote count</p>
        </div>
        {showApplyForm && (
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Apply for Candidature</h2>
            <form onSubmit={handleApplySubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" id="name" name="name" value={applyForm.name} onChange={handleApplyChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your name" />
              </div>
              <div>
                <label htmlFor="party" className="block text-sm font-medium text-gray-700 mb-2">Party</label>
                <input type="text" id="party" name="party" value={applyForm.party} onChange={handleApplyChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your party" />
              </div>
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input type="url" id="imageUrl" name="imageUrl" value={applyForm.imageUrl} onChange={handleApplyChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter image URL (optional)" />
              </div>
              {applyError && <div className="text-red-600 text-sm">{applyError}</div>}
              <button type="submit" disabled={applyLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {applyLoading ? 'Submitting...' : 'Apply'}
              </button>
            </form>
          </div>
        )}
        {candidate && (
          <div className="max-w-4xl mx-auto">
            {/* Candidate Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Candidate Image */}
                <div className="flex-shrink-0">
                  <img
                    src={candidate.imageUrl}
                    alt={candidate.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=Candidate';
                    }}
                  />
                </div>
                {/* Candidate Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{candidate.name}</h2>
                  <p className="text-xl text-gray-600 mb-6">{candidate.party}</p>
                  {/* Vote Count */}
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {candidate.voteCount}
                      </div>
                      <div className="text-blue-700 font-medium">
                        {candidate.voteCount === 1 ? 'vote' : 'votes'} received
                      </div>
                    </div>
                  </div>
                  {/* Campaign Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">Campaign Status</div>
                      <div className="text-lg font-semibold text-gray-900">Active</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">Registration Date</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* All Candidates Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">All Candidates & Vote Counts</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidates.map((c) => (
                      <tr key={c._id} className={c.userId === candidate.userId ? 'bg-blue-50' : ''}>
                        <td className="px-4 py-2 font-medium text-gray-900">{c.name}</td>
                        <td className="px-4 py-2 text-gray-700">{c.party}</td>
                        <td className="px-4 py-2 text-blue-700 font-bold">{c.voteCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Campaign Message and Tips (existing code) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Campaign Message</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  Thank you for your support! As a candidate representing {candidate.party}, 
                  I am committed to serving our community with integrity and dedication. 
                  Every vote counts, and I appreciate your trust in me.
                </p>
              </div>
            </div>
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Campaign Tips</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Engage with voters through social media and community events
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Share your vision and policy proposals clearly
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Stay connected with your supporters and keep them informed
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Monitor your vote count and campaign progress regularly
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 