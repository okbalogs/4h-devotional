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
    
    // Group message
    if (body.group_id) {
      const { group_id, content } = body;
      const msgRef = adminDb.collection('group_messages').doc();
      const newMsg = {
        group_id,
        user_id: user.uid,
        author_name: user.name || 'Devotee',
        content,
        created_at: new Date().toISOString()
      };
      await msgRef.set(newMsg);

      // We should ideally notify other members here, but for now just save the message
      return NextResponse.json({ id: msgRef.id, ...newMsg });
    }

    // Partner message
    if (body.partnership_id) {
      const { partnership_id, type, content, sender_name } = body;
      const msgRef = adminDb.collection('partner_messages').doc();
      const newMsg = {
        partnership_id,
        sender_id: user.uid,
        sender_name: sender_name || user.name || 'Devotee',
        type, // 'note', 'prayer', 'nudge'
        content,
        created_at: new Date().toISOString()
      };
      await msgRef.set(newMsg);

      return NextResponse.json({ id: msgRef.id, ...newMsg });
    }

    return NextResponse.json({ error: 'Invalid message target' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const msg_id = searchParams.get('msg_id');
    const type = searchParams.get('type'); // 'group' or 'partner'

    const collectionName = type === 'group' ? 'group_messages' : 'partner_messages';
    const docRef = adminDb.collection(collectionName).doc(msg_id);
    const doc = await docRef.get();
    
    // Determine the field name for the user id depending on the type
    const userIdField = type === 'group' ? 'user_id' : 'sender_id';

    if (doc.exists && doc.data()[userIdField] === user.uid) {
      await docRef.delete();
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
