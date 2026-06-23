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

export async function POST(req) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    // Post prayer request
    if (action === 'create') {
      const { content, is_anonymous } = body;
      const ref = adminDb.collection('prayer_requests').doc();
      const newReq = {
        user_id: user.uid,
        poster_name: user.name || 'Devotee',
        content,
        is_anonymous,
        created_at: new Date().toISOString()
      };
      await ref.set(newReq);
      return NextResponse.json({ id: ref.id, ...newReq });
    }

    // Toggle pray response
    if (action === 'toggle_pray') {
      const { request_id } = body;
      const responsesRef = adminDb.collection('prayer_responses');
      const snapshot = await responsesRef.where('request_id', '==', request_id).where('user_id', '==', user.uid).get();

      if (snapshot.empty) {
        await responsesRef.add({
          request_id,
          user_id: user.uid,
          created_at: new Date().toISOString()
        });
        
        // Notify the poster
        const reqDoc = await adminDb.collection('prayer_requests').doc(request_id).get();
        if (reqDoc.exists && reqDoc.data().user_id !== user.uid) {
           await adminDb.collection('notifications').add({
             user_id: reqDoc.data().user_id,
             type: 'prayer_prayed',
             title: 'Someone prayed',
             body: `${user.name || 'Devotee'} prayed for your request`,
             link: '/community?tab=prayer',
             is_read: false,
             created_at: new Date().toISOString()
           });
        }
        
        return NextResponse.json({ action: 'added' });
      } else {
        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        return NextResponse.json({ action: 'removed' });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const docRef = adminDb.collection('prayer_requests').doc(id);
    const doc = await docRef.get();

    if (doc.exists && doc.data().user_id === user.uid) {
      await docRef.delete();
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
