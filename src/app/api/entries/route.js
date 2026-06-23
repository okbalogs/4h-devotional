import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/utils/firebaseAdmin';

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

export async function POST(req) {
  const uid = await verifyAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    
    // Validate required fields based on the old entryPayload
    const newEntry = {
      user_id: uid,
      scripture_reference: body.scripture_reference || '',
      verse_text: body.verse_text || '',
      hear: body.hear || '',
      heed: body.heed || '',
      hold: body.hold || '',
      help: body.help || '',
      lingering_thought: body.lingering_thought || '',
      created_at: new Date().toISOString()
    };

    const docRef = await adminDb.collection('entries').add(newEntry);

    return NextResponse.json({ id: docRef.id, ...newEntry });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  const uid = await verifyAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const countOnly = searchParams.get('count_only') === 'true';

    let query = adminDb.collection('entries').where('user_id', '==', uid);

    if (countOnly) {
      const snapshot = await query.count().get();
      return NextResponse.json({ count: snapshot.data().count });
    }

    if (start) query = query.where('created_at', '>=', start);
    if (end) query = query.where('created_at', '<=', end);
    
    query = query.orderBy('created_at', 'desc');

    const snapshot = await query.get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

