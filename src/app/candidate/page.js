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
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ party: '', campaignMessage: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const router = useRouter();

  // Helper function to get user ID reliably
  const getUserId = (userObj) => {
    // Try multiple ways to get the user ID
    return userObj?.id || userObj?._id || userObj?.userId;
  };

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
      console.log('Parsed user from localStorage:', user);
      console.log('User keys:', Object.keys(user));
      console.log('User id:', user.id);
      console.log('User _id:', user._id);
      
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
      const currentUserId = userObj?.id || userObj?._id || user?.id || user?._id;
      console.log('Looking for candidate with userId:', currentUserId);
      console.log('Available candidates:', data.candidates.map(c => ({ id: c._id, name: c.name, userId: c.userId })));
      
      const userCandidate = data.candidates.find(c => c.userId === currentUserId);
      if (userCandidate) {
        console.log('Found user candidate:', userCandidate);
        setCandidate(userCandidate);
        setShowApplyForm(false);
      } else {
        console.log('No candidate found for user, showing apply form');
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
      console.log('Submitting candidate application:', {
        name: applyForm.name,
        party: applyForm.party,
        imageUrl: applyForm.imageUrl,
        userId: user.id,
        userIdType: typeof user.id,
        userObject: user
      });
      
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
          userId: user.id || user._id
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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/candidates/${candidate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          party: editForm.party,
          campaignMessage: editForm.campaignMessage
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      // Refresh candidate data
      await fetchCandidateData(user);
      setShowEditProfile(false);
    } catch (error) {
      setEditError(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const startEditing = () => {
    setEditForm({
      party: candidate.party || '',
      campaignMessage: candidate.campaignMessage || 'Thank you for your support! As a candidate representing ' + candidate.party + ', I am committed to serving our community with integrity and dedication. Every vote counts, and I appreciate your trust in me.'
    });
    setShowEditProfile(true);
  };

  const cancelEditing = () => {
    setShowEditProfile(false);
    setEditError(null);
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
            {/* Vote Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Your Votes</p>
                    <p className="text-3xl font-bold">{candidate.voteCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Votes Cast</p>
                    <p className="text-3xl font-bold">{candidates.reduce((sum, c) => sum + c.voteCount, 0)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Your Ranking</p>
                    <p className="text-3xl font-bold">
                      #{candidates.sort((a, b) => b.voteCount - a.voteCount).findIndex(c => c.userId === candidate.userId) + 1}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* All Candidates Leaderboard */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Candidate Leaderboard
              </h3>
              <div className="space-y-4">
                {candidates
                  .sort((a, b) => b.voteCount - a.voteCount)
                  .map((c, index) => {
                    const isCurrentUser = c.userId === candidate.userId;
                    const getRankIcon = (rank) => {
                      if (rank === 0) return "1st";
                      if (rank === 1) return "2nd";
                      if (rank === 2) return "3rd";
                      return `#${rank + 1}`;
                    };
                    
                    return (
                      <div
                        key={c._id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          isCurrentUser 
                            ? 'bg-blue-50 border-blue-200 shadow-md' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-gray-600 min-w-[3rem] text-center">
                            {getRankIcon(index)}
                          </div>
                          <div className="flex items-center space-x-3">
                            <img
                              src={c.imageUrl}
                              alt={c.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/50x50/3b82f6/ffffff?text=C';
                              }}
                            />
                            <div>
                              <h4 className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                                {c.name} {isCurrentUser && <span className="text-blue-600">(You)</span>}
                              </h4>
                              <p className={`text-sm ${isCurrentUser ? 'text-blue-700' : 'text-gray-600'}`}>
                                {c.party}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${isCurrentUser ? 'text-blue-600' : 'text-gray-700'}`}>
                            {c.voteCount}
                          </div>
                          <div className={`text-sm ${isCurrentUser ? 'text-blue-600' : 'text-gray-500'}`}>
                            {c.voteCount === 1 ? 'vote' : 'votes'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
            {/* Editable Profile Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Profile Settings</h3>
                {!showEditProfile && (
                  <button
                    onClick={startEditing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {showEditProfile ? (
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="editParty" className="block text-sm font-medium text-gray-700 mb-2">Party Name</label>
                    <input
                      type="text"
                      id="editParty"
                      name="party"
                      value={editForm.party}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your party name"
                    />
                  </div>
                  <div>
                    <label htmlFor="editCampaignMessage" className="block text-sm font-medium text-gray-700 mb-2">Campaign Message</label>
                    <textarea
                      id="editCampaignMessage"
                      name="campaignMessage"
                      value={editForm.campaignMessage}
                      onChange={handleEditChange}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Write your campaign message here..."
                    />
                  </div>
                  {editError && <div className="text-red-600 text-sm">{editError}</div>}
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Party Name</h4>
                    <p className="text-lg font-semibold text-gray-900">{candidate.party}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Campaign Message</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">
                        {candidate.campaignMessage || 
                          `Thank you for your support! As a candidate representing ${candidate.party}, I am committed to serving our community with integrity and dedication. Every vote counts, and I appreciate your trust in me.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
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