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
    const { partner_email } = body;

    // Check if the invited user exists
    const userRecord = await adminAuth.getUserByEmail(partner_email).catch(() => null);
    
    // Create invite whether they exist or not, they can accept when they create an account with that email.
    // However, if they don't exist in our Firebase users we can't reliably find their UID right away, so we just use email for lookup later.
    
    // Check if already invited
    const invitesRef = adminDb.collection('accountability_partners');
    const existing = await invitesRef
      .where('requester_id', '==', user.uid)
      .where('partner_email', '==', partner_email)
      .get();
      
    if (!existing.empty) {
       return NextResponse.json({ error: 'Invite already sent' }, { status: 400 });
    }

    const newInvite = {
      requester_id: user.uid,
      requester_name: user.name || 'Devotee',
      partner_email,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const docRef = await invitesRef.add(newInvite);

    if (userRecord) {
      await adminDb.collection('notifications').add({
        user_id: userRecord.uid,
        type: 'invite',
        title: 'Partnership Request',
        body: `${user.name || 'Devotee'} invited you to be their accountability partner`,
        link: '/community?tab=partners',
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ id: docRef.id, ...newInvite });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { invite_id, action } = body;

    const docRef = adminDb.collection('accountability_partners').doc(invite_id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }
    
    const inviteData = doc.data();
    
    // Verify user is the intended recipient (they must have the matching email)
    // In our new flow, we just check if the user's email matches partner_email
    const currentUser = await adminAuth.getUser(user.uid);
    if (inviteData.partner_email !== currentUser.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (action === 'accept') {
      await docRef.update({ 
        partner_id: user.uid,
        partner_name: user.name || 'Devotee',
        status: 'active',
        updated_at: new Date().toISOString()
      });

      // Notify requester
      await adminDb.collection('notifications').add({
        user_id: inviteData.requester_id,
        type: 'accepted',
        title: 'Partnership Accepted',
        body: `${user.name || 'Devotee'} accepted your request`,
        link: '/community?tab=partners',
        is_read: false,
        created_at: new Date().toISOString()
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'decline') {
      await docRef.update({ 
        status: 'declined',
        updated_at: new Date().toISOString()
      });
      return NextResponse.json({ success: true });
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
    const invite_id = searchParams.get('id');

    const docRef = adminDb.collection('accountability_partners').doc(invite_id);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      if (data.requester_id === user.uid || data.partner_id === user.uid) {
         await docRef.delete();
         return NextResponse.json({ success: true });
      }
    }
    
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
