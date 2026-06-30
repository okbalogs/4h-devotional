import { NextResponse } from 'next/server';
import { adminAuth } from '@/utils/firebaseAdmin';

// Entries live in localStorage on the client. This route only verifies auth.
// GET: client should read from localStorage directly (returns 404 stub for API calls)
// PUT: verify auth, return updated fields so client can patch localStorage
// DELETE: verify auth, return success so client can remove from localStorage

async function verifyAuth(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET(req, { params }) {
  const uid = await verifyAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Client reads from localStorage; this endpoint is a no-op
  return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
}

export async function PUT(req, { params }) {
  const uid = await verifyAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const allowed = ['scripture_reference', 'verse_text', 'hear', 'heed', 'hold', 'help', 'lingering_thought'];
    const updates = {};
    for (const field of allowed) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    return NextResponse.json({ success: true, ...updates });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const uid = await verifyAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ success: true });
}

