import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Voter from '@/models/Voter';
import { getUserFromRequest } from '@/lib/auth';

// GET: Check if a specific user has voted
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { userId } = params;

    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Users can only check their own status or admins can check any
    if (user.id !== userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Find voter record
    const voter = await Voter.findOne({ userId }).populate('votedFor', 'name party');

    if (!voter) {
      return NextResponse.json({
        hasVoted: false,
        votedFor: null,
        votedAt: null
      });
    }

    return NextResponse.json({
      hasVoted: voter.hasVoted,
      votedFor: voter.votedFor,
      votedAt: voter.votedAt
    });

  } catch (error) {
    console.error('Get voter status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 