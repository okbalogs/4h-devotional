import { NextResponse } from 'next/server';
import { adminAuth } from '@/utils/firebaseAdmin';

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
  // Streak is now calculated client-side from localStorage — this endpoint is deprecated
  return NextResponse.json({ streak: 0, totalEntries: 0, recentDays: [] });

  try {
    const snapshot = { empty: true, docs: [] }; // Firestore removed
      
    if (snapshot.empty) {
      const recentDays = [];
      const d = new Date();
      for (let i = 6; i >= 0; i--) {
        const pastDate = new Date(d);
        pastDate.setDate(d.getDate() - i);
        recentDays.push({
           label: ['S','M','T','W','T','F','S'][pastDate.getDay()],
           filled: false
        });
      }
      return NextResponse.json({ streak: 0, totalEntries: 0, recentDays });
    }

    const data = snapshot.docs.map(doc => doc.data());
    const toDay = (d) => new Date(d).toLocaleDateString('en-CA');
    
    // Handle both Firestore Timestamp and ISO string
    const getDateStr = (val) => {
      if (val?.toDate) return toDay(val.toDate());
      return toDay(val);
    };

    const uniqueDates = [...new Set(data.map((e) => getDateStr(e.created_at)))].sort(
      (a, b) => b.localeCompare(a)
    );

    const today = toDay(new Date());
    const yesterday = toDay(new Date(Date.now() - 86_400_000));

    // Streak stays alive if logged today or yesterday
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      const recentDays = [];
      const d = new Date();
      for (let i = 6; i >= 0; i--) {
        const pastDate = new Date(d);
        pastDate.setDate(d.getDate() - i);
        recentDays.push({
           label: ['S','M','T','W','T','F','S'][pastDate.getDay()],
           filled: uniqueDates.includes(toDay(pastDate))
        });
      }
      return NextResponse.json({ streak: 0, totalEntries: data.length, recentDays });
    }

    let currentStreak = 0;
    let expectedDate = uniqueDates[0] === today ? new Date() : new Date(Date.now() - 86_400_000);

    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === toDay(expectedDate)) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }

    const recentDays = [];
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const pastDate = new Date(d);
      pastDate.setDate(d.getDate() - i);
      recentDays.push({
         label: ['S','M','T','W','T','F','S'][pastDate.getDay()],
         filled: uniqueDates.includes(toDay(pastDate))
      });
    }

    return NextResponse.json({ streak: currentStreak, totalEntries: data.length, recentDays });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
