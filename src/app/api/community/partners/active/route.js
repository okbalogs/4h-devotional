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

export async function GET(req) {
  const uid = await verifyAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Check if user is requester or partner
    const query1 = adminDb.collection('accountability_partners')
      .where('requester_id', '==', uid)
      .where('status', '==', 'active')
      .get();
      
    const query2 = adminDb.collection('accountability_partners')
      .where('partner_id', '==', uid)
      .where('status', '==', 'active')
      .get();

    const [snap1, snap2] = await Promise.all([query1, query2]);
    
    let partnership = null;
    if (!snap1.empty) {
      partnership = { id: snap1.docs[0].id, ...snap1.docs[0].data() };
    } else if (!snap2.empty) {
      partnership = { id: snap2.docs[0].id, ...snap2.docs[0].data() };
    }

    if (partnership) {
      return NextResponse.json(partnership);
    }

    return NextResponse.json(null);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
