import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/utils/firebaseAdmin';

async function verifyAuth(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (err) {
    return null;
  }
}

export async function PUT(req) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { types } = body;

    const notifsRef = adminDb.collection('notifications');
    const snapshot = await notifsRef
       .where('user_id', '==', user.uid)
       .where('is_read', '==', false)
       .where('type', 'in', types)
       .get();

    if (!snapshot.empty) {
      const batch = adminDb.batch();
      snapshot.docs.forEach(doc => {
         batch.update(doc.ref, { is_read: true });
      });
      await batch.commit();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
