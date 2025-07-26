import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Candidate from '@/models/Candidate';
import Voter from '@/models/Voter';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();

    const { name, email, password, role } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['voter', 'candidate', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be voter, candidate, or admin' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    // Create role-specific records
    if (role === 'candidate') {
      const candidate = new Candidate({
        name,
        party: 'Independent', // Default party, can be updated later
        imageUrl: 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=Candidate',
        voteCount: 0,
        userId: user._id
      });
      await candidate.save();
    } else if (role === 'voter') {
      const voter = new Voter({
        userId: user._id,
        hasVoted: false
      });
      await voter.save();
    }

    // Generate token
    const token = generateToken(user);

    return NextResponse.json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 