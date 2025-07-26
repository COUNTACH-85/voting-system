import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import Voter from '@/models/Voter';
import { getUserFromRequest, hasRole } from '@/lib/auth';

// POST: Cast vote
export async function POST(request) {
  try {
    await connectDB();

    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a voter
    if (!hasRole(user, 'voter')) {
      return NextResponse.json(
        { error: 'Only voters can cast votes' },
        { status: 403 }
      );
    }

    const { candidateId } = await request.json();

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // Check if candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Get or create voter record
    let voter = await Voter.findOne({ userId: user.id });
    if (!voter) {
      voter = new Voter({
        userId: user.id,
        hasVoted: false
      });
    }

    // Check if voter has already voted
    if (voter.hasVoted) {
      return NextResponse.json(
        { error: 'You have already voted' },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity
    const session = await connectDB().startSession();
    
    try {
      await session.withTransaction(async () => {
        // Update voter record
        voter.hasVoted = true;
        voter.votedFor = candidateId;
        voter.votedAt = new Date();
        await voter.save({ session });

        // Increment candidate vote count
        await Candidate.findByIdAndUpdate(
          candidateId,
          { $inc: { voteCount: 1 } },
          { session }
        );
      });

      return NextResponse.json({
        message: 'Vote cast successfully',
        candidate: candidate.name
      });

    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 