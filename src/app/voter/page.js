'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CandidateCard from '@/components/CandidateCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';

export default function VoterDashboard() {
  const [user, setUser] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [voterStatus, setVoterStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info');
  
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
      if (user.role !== 'voter') {
        router.push('/');
        return;
      }
      
      setUser(user);
      fetchData();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch candidates and voter status in parallel
      const [candidatesResponse, voterStatusResponse] = await Promise.all([
        fetch('/api/candidates'),
        fetch(`/api/voter-status/${user?.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (!candidatesResponse.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const candidatesData = await candidatesResponse.json();
      setCandidates(candidatesData.candidates);

      if (voterStatusResponse.ok) {
        const voterData = await voterStatusResponse.json();
        setVoterStatus(voterData);
      }

    } catch (error) {
      setError('Failed to load data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll for updates every 5 seconds
  useEffect(() => {
    if (!loading) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleVote = async (candidateId) => {
    setActionLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ candidateId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cast vote');
      }

      setModalMessage('Vote cast successfully!');
      setModalType('success');
      setShowModal(true);
      
      // Refresh data
      await fetchData();
      
      // Clear success message after 3 seconds
      setTimeout(() => setShowModal(false), 3000);

    } catch (error) {
      setModalMessage(error.message);
      setModalType('error');
      setShowModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const hasVoted = voterStatus?.hasVoted || false;
  const votedFor = voterStatus?.votedFor;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Voter Dashboard</h1>
          <p className="text-gray-600">Cast your vote and view real-time results</p>
        </div>

        {/* Voting Status */}
        <div className="mb-8">
          {hasVoted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-green-800">Vote Cast Successfully!</h3>
                  <p className="text-green-700">
                    You voted for {votedFor?.name} ({votedFor?.party})
                  </p>
                  {voterStatus?.votedAt && (
                    <p className="text-sm text-green-600 mt-1">
                      Voted on {new Date(voterStatus.votedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-800">Ready to Vote</h3>
                  <p className="text-blue-700">Select a candidate below to cast your vote</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Votes Cast</p>
                <p className="text-2xl font-bold text-gray-900">
                  {candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leading Candidate</p>
                <p className="text-lg font-semibold text-gray-900">
                  {candidates.length > 0 
                    ? candidates.reduce((max, candidate) => 
                        candidate.voteCount > max.voteCount ? candidate : max
                      ).name
                    : 'None'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
              canVote={!hasVoted}
              hasVoted={hasVoted && votedFor?._id === candidate._id}
              onVote={handleVote}
              showVoteButton={true}
            />
          ))}
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates available</h3>
            <p className="text-gray-600">Candidates will appear here once they are added by an administrator</p>
          </div>
        )}
      </div>

      {/* Status Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'success' ? 'Success' : 'Error'}
        type={modalType}
        showCloseButton={false}
      >
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            modalType === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {modalType === 'success' ? (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <p className="text-gray-700">{modalMessage}</p>
        </div>
      </Modal>
    </div>
  );
} 