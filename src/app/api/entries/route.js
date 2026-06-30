import { NextResponse } from 'next/server';
import { adminAuth } from '@/utils/firebaseAdmin';

// Entries are stored in localStorage on the client (no Firestore).
// POST just verifies auth and returns the entry with a server timestamp.
// GET returns empty — client reads from localStorage directly.

async function verifyAuth(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch { return null; }
}

export async function POST(req) {
  const uid = await verifyAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const entry = {
      user_id: uid,
      scripture_reference: body.scripture_reference || '',
      verse_text: body.verse_text || '',
      hear: body.hear || '',
      heed: body.heed || '',
      hold: body.hold || '',
      help: body.help || '',
      lingering_thought: body.lingering_thought || '',
      created_at: new Date().toISOString(),
    };
    // Client will save to localStorage using saveLocalEntry()
    return NextResponse.json({ id: `local_${Date.now()}`, ...entry });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  const uid = await verifyAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Client reads entries from localStorage directly
  return NextResponse.json([]);
}
