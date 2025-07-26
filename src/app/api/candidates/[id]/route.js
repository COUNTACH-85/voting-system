import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import { getUserFromRequest, hasRole } from '@/lib/auth';

// DELETE: Remove candidate by ID (Admin only)
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

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