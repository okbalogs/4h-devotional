import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/utils/firebaseAdmin';

// Helper to verify token
async function verifyAuth(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (err) {
    return null;
  }
}

export async function GET(req) {
  const uid = await verifyAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const doc = await adminDb.collection('profiles').doc(uid).get();
    if (!doc.exists) {
      // Return default profile
      return NextResponse.json({
        bible_version: 'web',
        exam_mode: false,
        avatar_url: null,
        church: '',
        academic_level: '',
        reminders_enabled: true,
        reminder_time: '06:00',
        public_profile: false,
        weekly_summary: true,
        community_prayers: false
      });
    }
    return NextResponse.json(doc.data());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const uid = await verifyAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    // Filter allowed fields
    const updateData = {};
    const allowedFields = [
      'bible_version', 'exam_mode', 'avatar_url', 'church', 'academic_level',
      'reminders_enabled', 'reminder_time', 'public_profile', 'weekly_summary', 'community_prayers'
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    updateData.updated_at = new Date().toISOString();

    await adminDb.collection('profiles').doc(uid).set(updateData, { merge: true });
    return NextResponse.json({ success: true, profile: updateData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
