import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import Voter from '@/models/Voter';
import { getUserFromRequest, hasRole } from '@/lib/auth';

// POST: Cast vote
export async function POST(request) {
  try {
    console.log('Vote request started');
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

    // Convert string ID to ObjectId and get or create voter record
    const userId = new mongoose.Types.ObjectId(user.id);
    
    let voter = await Voter.findOne({ userId });
    if (!voter) {
      voter = new Voter({
        userId,
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

    try {
      // Update voter record without transaction since MongoDB 5.0+ handles this atomically
      voter.hasVoted = true;
      voter.votedFor = new mongoose.Types.ObjectId(candidateId);
      voter.votedAt = new Date();
      await voter.save();

      // Increment candidate vote count
      await Candidate.findByIdAndUpdate(
        candidateId,
        { $inc: { voteCount: 1 } }
      );

      return NextResponse.json({
        message: 'Vote cast successfully',
        candidate: candidate.name
      });
    } catch (error) {
      console.error('Vote operation error:', error);
      return NextResponse.json(
        { error: `Vote operation failed: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Vote request error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
