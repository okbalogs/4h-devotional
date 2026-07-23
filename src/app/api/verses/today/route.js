import { NextResponse } from 'next/server';
import { adminAuth } from '@/utils/firebaseAdmin';

const STUDENT_PLANS = [
  { title: "Foundation of Trust", verses: ["Proverbs 3:5-6", "Philippians 4:6-7", "Isaiah 40:31", "Jeremiah 29:11", "Matthew 6:33"] },
  { title: "Courage & Action", verses: ["Joshua 1:9", "Colossians 3:23-24", "James 1:2-4", "Hebrews 11:1", "Psalm 119:105"] },
  { title: "Strength & Guidance", verses: ["Isaiah 41:10", "2 Timothy 3:16-17", "Romans 12:1-2", "Proverbs 16:3", "Philippians 4:13"] },
  { title: "Wisdom & Purpose", verses: ["Psalm 37:4", "Proverbs 4:23", "Ephesians 5:15-16", "1 Timothy 4:12", "Psalm 1:1-3"] },
  { title: "Diligence & Excellence", verses: ["Proverbs 22:29", "Daniel 1:17", "Ecclesiastes 9:10", "1 Corinthians 10:31", "Romans 8:28"] }
];

const EXAM_PLANS = [
  { title: "Overcoming Anxiety", verses: ["John 14:27", "Philippians 4:6", "Isaiah 26:3", "2 Timothy 1:7", "Psalm 55:22"] },
  { title: "God's Help in Trials", verses: ["1 Peter 5:7", "Psalm 46:1", "Isaiah 41:13", "Proverbs 16:3", "Colossians 3:23"] },
  { title: "Wisdom for Tests", verses: ["James 1:5", "Psalm 121:1-2", "Proverbs 2:6", "Isaiah 40:29", "Philippians 4:13"] }
];

function getFlatList(plans) {
  return plans.flatMap(p => p.verses);
}

function getJourneyDay(creationTime) {
  const created = new Date(creationTime);
  const today = new Date();
  created.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.floor((today - created) / 86400000) + 1;
}

export async function GET(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const userRecord = await adminAuth.getUser(uid);
    const journeyDay = getJourneyDay(userRecord.metadata.creationTime);

    // Read preferences + examMode from query params (sent by client, no DB needed)
    const { searchParams } = new URL(req.url);
    const bibleVersion = searchParams.get('translation') || 'web';
    const examMode = searchParams.get('examMode') === 'true';

    const list = getFlatList(examMode ? EXAM_PLANS : STUDENT_PLANS);
    const expectedRef = list[(journeyDay - 1) % list.length];

    // Fetch from Bible API (timeout after 8s)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let json;
    try {
      const url = `https://bible-api.com/${encodeURIComponent(expectedRef)}?translation=${bibleVersion}`;
      const res = await fetch(url, { signal: controller.signal });
      json = await res.json();
    } finally {
      clearTimeout(timeout);
    }

    // Fallback to WEB translation if chosen version doesn't have the verse
    if (!json?.text && bibleVersion !== 'web') {
      const fallbackRes = await fetch(`https://bible-api.com/${encodeURIComponent(expectedRef)}?translation=web`);
      json = await fallbackRes.json();
    }

    if (!json?.text) {
      return NextResponse.json(
        { error: `Bible API could not find "${expectedRef}": ${json?.error ?? 'unknown error'}` },
        { status: 502 }
      );
    }

    // Return verse — client caches it in localStorage via offlineStorage.js
    return NextResponse.json({
      journeyDay,
      user_id: uid,
      journey_day: journeyDay,
      verse_reference: json.reference ?? expectedRef,
      verse_text: json.text.trim().replace(/\n/g, ' '),
      bible_version: bibleVersion,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
