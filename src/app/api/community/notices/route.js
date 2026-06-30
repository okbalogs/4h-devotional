export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/utils/firebaseAdmin';

const ADMIN_EMAILS = ['olaolubalogs@gmail.com'];

async function verifyAdmin(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
    if (!ADMIN_EMAILS.includes(decoded.email?.toLowerCase())) return null;
    return decoded;
  } catch { return null; }
}

export async function POST(req) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { title, content } = await req.json();
    if (!title?.trim() || !content?.trim())
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });

    const ref = await adminDb.collection('notices').add({
      author_id: admin.uid,
      author_email: admin.email,
      title: title.trim(),
      content: content.trim(),
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ id: ref.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await adminDb.collection('notices').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
