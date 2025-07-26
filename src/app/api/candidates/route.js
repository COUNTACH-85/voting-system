import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import User from '@/models/User';
import { getUserFromRequest, hasRole } from '@/lib/auth';

// GET: Fetch all candidates
export async function GET() {
  try {
    await connectDB();

    const candidates = await Candidate.find({})
      .sort({ voteCount: -1, name: 1 })
      .lean();

    return NextResponse.json({
      candidates
    });

  } catch (error) {
    console.error('Get candidates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add new candidate (Admin only)
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

    const { name, party, imageUrl, userId } = await request.json();

    // Validate required fields
    if (!name || !party) {
      return NextResponse.json(
        { error: 'Name and party are required' },
        { status: 400 }
      );
    }

    // If admin, allow adding generic candidates (no userId required)
    if (hasRole(user, 'admin')) {
      // Check if candidate already exists (by name+party)
      const existingCandidate = await Candidate.findOne({ name, party });
      if (existingCandidate) {
        return NextResponse.json(
          { error: 'Candidate with this name and party already exists' },
          { status: 409 }
        );
      }
      const candidate = new Candidate({
        name,
        party,
        imageUrl: imageUrl || 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=Candidate',
        voteCount: 0
      });
      await candidate.save();
      return NextResponse.json({
        message: 'Candidate added successfully',
        candidate
      }, { status: 201 });
    }

    // If candidate, allow self-application (must provide userId matching their own)
    if (hasRole(user, 'candidate')) {
      if (!userId || userId !== user.id) {
        return NextResponse.json(
          { error: 'Invalid userId for candidate application' },
          { status: 400 }
        );
      }
      // Prevent duplicate candidate profile for this user
      const existingCandidate = await Candidate.findOne({ userId });
      if (existingCandidate) {
        return NextResponse.json(
          { error: 'You have already applied for candidature' },
          { status: 409 }
        );
      }
      const candidate = new Candidate({
        name,
        party,
        imageUrl: imageUrl || 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=Candidate',
        voteCount: 0,
        userId
      });
      await candidate.save();
      return NextResponse.json({
        message: 'Candidature application successful',
        candidate
      }, { status: 201 });
    }

    // Otherwise, forbidden
    return NextResponse.json(
      { error: 'Not authorized to add candidate' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Add candidate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 