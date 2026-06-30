import { auth } from './firebase';
import { getLocalVerse, setLocalVerse, getLocalEntries } from './offlineStorage';

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

export function getJourneyDay(user) {
  // Extract from Firebase auth creation time (fallback to now if missing)
  const created = user?.metadata?.creationTime ? new Date(user.metadata.creationTime) : new Date();
  const today = new Date();
  created.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.floor((today - created) / 86400000) + 1;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

async function getAuthHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function getUserPreferences(userId) {
  try {
    const res = await fetch('/api/profile', { headers: await getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch profile');
    const data = await res.json();
    return {
      bibleVersion: data.bible_version ?? 'web',
      examMode: data.exam_mode ?? false,
      avatarUrl: data.avatar_url ?? null
    };
  } catch (err) {
    return { bibleVersion: 'web', examMode: false };
  }
}

export async function getTodayVerseForUser(user) {
  try {
    // Check localStorage cache first
    const uid = user?.uid || user?.id;
    const journeyDay = getJourneyDay(user);
    const cached = getLocalVerse(uid, journeyDay);
    if (cached?.verse_text) return cached;

    // Fetch preferences from localStorage (set by settings page)
    const bibleVersion = localStorage.getItem('bible_version') || 'web';
    const examMode = localStorage.getItem('exam_mode') === 'true';

    const params = new URLSearchParams({ translation: bibleVersion, examMode });
    const res = await fetch(`/api/verses/today?${params}`, { headers: await getAuthHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error('[getTodayVerseForUser] API error:', res.status, body?.error);
      return null;
    }
    const data = await res.json();

    // Cache in localStorage for offline + instant load
    setLocalVerse(uid, journeyDay, data);
    return data;
  } catch (err) {
    console.error('[getTodayVerseForUser]', err.message);
    return null;
  }
}

export function getStreakAndCount(userId) {
  const toDay = (d) => new Date(d).toLocaleDateString('en-CA');
  const entries = getLocalEntries(userId);

  const recentDays = [];
  const now = new Date();
  const uniqueDates = [...new Set(entries.map(e => toDay(e.created_at)))].sort((a, b) => b.localeCompare(a));

  for (let i = 6; i >= 0; i--) {
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - i);
    recentDays.push({
      label: ['S','M','T','W','T','F','S'][pastDate.getDay()],
      filled: uniqueDates.includes(toDay(pastDate)),
    });
  }

  if (!uniqueDates.length) return { streak: 0, totalEntries: 0, recentDays };

  const today = toDay(now);
  const yesterday = toDay(new Date(Date.now() - 86_400_000));
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return { streak: 0, totalEntries: entries.length, recentDays };
  }

  let streak = 0;
  let expected = new Date(uniqueDates[0] === today ? now : new Date(Date.now() - 86_400_000));
  for (const dateStr of uniqueDates) {
    if (dateStr === toDay(expected)) {
      streak++;
      expected.setDate(expected.getDate() - 1);
    } else break;
  }

  return { streak, totalEntries: entries.length, recentDays };
}

export function getCurrentPlanInfo(user, examMode = false) {
  const journeyDay = getJourneyDay(user);
  const plans = examMode ? EXAM_PLANS : STUDENT_PLANS;
  
  const totalVerses = getFlatList(plans).length;
  const currentOverallDay = ((journeyDay - 1) % totalVerses) + 1;
  
  let dayAccumulator = 0;
  for (const plan of plans) {
    if (currentOverallDay <= dayAccumulator + plan.verses.length) {
      return {
        title: plan.title,
        currentDay: currentOverallDay - dayAccumulator,
        totalDays: plan.verses.length
      };
    }
    dayAccumulator += plan.verses.length;
  }
  
  return { title: plans[0].title, currentDay: 1, totalDays: 5 };
}
