'use client';

export default function CandidateCard({ 
  candidate, 
  onVote, 
  canVote = false, 
  hasVoted = false,
  isAdmin = false,
  onRemove = null,
  showVoteButton = true 
}) {
  const handleVote = () => {
    if (canVote && !hasVoted && onVote) {
      onVote(candidate._id);
    }
  };

  const handleRemove = () => {
    if (isAdmin && onRemove) {
      onRemove(candidate._id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Candidate Image */}
        <div className="flex justify-center mb-4">
          <img
            src={candidate.imageUrl}
            alt={candidate.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=Candidate';
            }}
          />
        </div>

        {/* Candidate Info */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {candidate.name}
          </h3>
          <p className="text-gray-600 mb-3">
            {candidate.party}
          </p>
          
          {/* Vote Count */}
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="text-2xl font-bold text-blue-600">
              {candidate.voteCount}
            </div>
            <div className="text-sm text-blue-700">
              {candidate.voteCount === 1 ? 'vote' : 'votes'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {showVoteButton && canVote && !hasVoted && (
            <button
              onClick={handleVote}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Vote for {candidate.name}
            </button>
          )}

          {hasVoted && (
            <div className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg text-center text-sm font-medium">
              ✓ You voted for this candidate
            </div>
          )}

          {isAdmin && onRemove && (
            <button
              onClick={handleRemove}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Remove Candidate
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 