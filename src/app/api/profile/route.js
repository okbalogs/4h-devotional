import { NextResponse } from 'next/server';
import { adminAuth } from '@/utils/firebaseAdmin';

// Profile is stored in localStorage on the client.
// These routes just verify auth and echo back — no database needed.

async function verifyAuth(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch { return null; }
}

const DEFAULT_PROFILE = {
  bible_version: 'web',
  exam_mode: false,
  avatar_url: null,
  church: '',
  academic_level: '',
  reminders_enabled: true,
  reminder_time: '06:00',
  public_profile: false,
  weekly_summary: true,
  community_prayers: false,
};

export async function GET(req) {
  const uid = await verifyAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Client reads real profile from localStorage; this just confirms auth is valid
  return NextResponse.json(DEFAULT_PROFILE);
}

export async function PUT(req) {
  const uid = await verifyAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Client saves profile to localStorage directly; nothing to persist server-side
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ success: true, profile: body });
}
