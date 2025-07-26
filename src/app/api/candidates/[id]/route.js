import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import { getUserFromRequest, hasRole } from '@/lib/auth';

// PUT: Update candidate profile (Candidate only)
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params; // Await params in Next.js 15
    const body = await request.json();
    const { party, campaignMessage } = body;

    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find candidate
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Check if user owns this candidate profile or is admin
    // Convert ObjectId to string for comparison
    const candidateUserId = candidate.userId ? candidate.userId.toString() : null;
    const currentUserId = user.id ? user.id.toString() : null;
    
    // Allow access if:
    // 1. User owns this candidate profile
    // 2. Candidate has no userId (unclaimed profile) and user is a candidate
    // 3. User is admin
    const canEdit = candidateUserId === currentUserId || 
                   (!candidateUserId && hasRole(user, 'candidate')) || 
                   hasRole(user, 'admin');
    
    if (!canEdit) {
      console.log('Access check failed:', {
        candidateUserId,
        currentUserId,
        userRole: user.role,
        isAdmin: hasRole(user, 'admin'),
        isUnclaimed: !candidateUserId
      });
      return NextResponse.json(
        { error: 'Access denied. You can only edit your own profile.' },
        { status: 403 }
      );
    }
    
    // If this is an unclaimed candidate profile, assign it to the current user
    const updateData = {
      party: party || candidate.party,
      campaignMessage: campaignMessage || candidate.campaignMessage
    };
    
    if (!candidateUserId && hasRole(user, 'candidate')) {
      updateData.userId = currentUserId;
      console.log('Assigning unclaimed candidate profile to user:', currentUserId);
    }

    // Update candidate
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      message: 'Profile updated successfully',
      candidate: updatedCandidate
    });

  } catch (error) {
    console.error('Update candidate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove candidate by ID (Admin only)
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params; // Await params in Next.js 15

    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin role
    if (!hasRole(user, 'admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Find and delete candidate
    const candidate = await Candidate.findByIdAndDelete(id);
    
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Candidate removed successfully',
      candidate
    });

  } catch (error) {
    console.error('Delete candidate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 