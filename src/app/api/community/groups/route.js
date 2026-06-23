import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/utils/firebaseAdmin';

async function verifyAuth(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (err) {
    return null;
  }
}

export async function POST(req) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action, ...data } = body;

    if (action === 'create') {
      const { name, church, city, description, meeting_schedule } = data;
      const groupRef = adminDb.collection('small_groups').doc();
      
      const newGroup = {
        name, church, city, description, meeting_schedule,
        leader_id: user.uid,
        leader_name: user.name || 'Devotee',
        created_at: new Date().toISOString()
      };

      await groupRef.set(newGroup);

      await adminDb.collection('group_members').add({
        group_id: groupRef.id,
        user_id: user.uid,
        member_name: user.name || 'Devotee',
        role: 'leader',
        created_at: new Date().toISOString()
      });

      return NextResponse.json({ id: groupRef.id, ...newGroup });
    }

    if (action === 'join') {
      const { group_id } = data;
      await adminDb.collection('group_members').add({
        group_id,
        user_id: user.uid,
        member_name: user.name || 'Devotee',
        role: 'member',
        created_at: new Date().toISOString()
      });

      // Optional: notify leader
      const groupDoc = await adminDb.collection('small_groups').doc(group_id).get();
      if (groupDoc.exists) {
        const groupData = groupDoc.data();
        if (groupData.leader_id !== user.uid) {
          await adminDb.collection('notifications').add({
            user_id: groupData.leader_id,
            type: 'group_join',
            title: '⛪ New member',
            body: `${user.name || 'Devotee'} joined ${groupData.name}`,
            link: '/community?tab=groups',
            is_read: false,
            created_at: new Date().toISOString()
          });
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { group_id, description, meeting_schedule } = body;
    
    const docRef = adminDb.collection('small_groups').doc(group_id);
    const doc = await docRef.get();
    
    if (doc.exists && doc.data().leader_id === user.uid) {
      await docRef.update({ description, meeting_schedule });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const group_id = searchParams.get('group_id');
    const member_id = searchParams.get('member_id'); // For removing members

    if (action === 'leave' || action === 'remove') {
      const targetUserId = action === 'remove' ? member_id : user.uid;
      const membersRef = adminDb.collection('group_members');
      const snapshot = await membersRef.where('group_id', '==', group_id).where('user_id', '==', targetUserId).get();
      
      const batch = adminDb.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();

      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const docRef = adminDb.collection('small_groups').doc(group_id);
      const doc = await docRef.get();
      if (doc.exists && doc.data().leader_id === user.uid) {
        await docRef.delete();
        // optionally delete members and messages, but Firestore doesn't do cascading deletes easily without cloud functions. We'll leave them dangling for MVP.
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
