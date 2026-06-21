import { supabase } from './supabase'
import { getLocalVerse, setLocalVerse } from './offlineStorage'

const STUDENT_PLANS = [
  {
    title: "Foundation of Trust",
    verses: ["Proverbs 3:5-6", "Philippians 4:6-7", "Isaiah 40:31", "Jeremiah 29:11", "Matthew 6:33"]
  },
  {
    title: "Courage & Action",
    verses: ["Joshua 1:9", "Colossians 3:23-24", "James 1:2-4", "Hebrews 11:1", "Psalm 119:105"]
  },
  {
    title: "Strength & Guidance",
    verses: ["Isaiah 41:10", "2 Timothy 3:16-17", "Romans 12:1-2", "Proverbs 16:3", "Philippians 4:13"]
  },
  {
    title: "Wisdom & Purpose",
    verses: ["Psalm 37:4", "Proverbs 4:23", "Ephesians 5:15-16", "1 Timothy 4:12", "Psalm 1:1-3"]
  },
  {
    title: "Diligence & Excellence",
    verses: ["Proverbs 22:29", "Daniel 1:17", "Ecclesiastes 9:10", "1 Corinthians 10:31", "Romans 8:28"]
  }
];

const EXAM_PLANS = [
  {
    title: "Overcoming Anxiety",
    verses: ["John 14:27", "Philippians 4:6", "Isaiah 26:3", "2 Timothy 1:7", "Psalm 55:22"]
  },
  {
    title: "God's Help in Trials",
    verses: ["1 Peter 5:7", "Psalm 46:1", "Isaiah 41:13", "Proverbs 16:3", "Colossians 3:23"]
  },
  {
    title: "Wisdom for Tests",
    verses: ["James 1:5", "Psalm 121:1-2", "Proverbs 2:6", "Isaiah 40:29", "Philippians 4:13"]
  }
];

function getFlatList(plans) {
  return plans.flatMap(p => p.verses);
}

export function getJourneyDay(user) {
  const created = new Date(user.created_at)
  const today = new Date()
  created.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return Math.floor((today - created) / 86400000) + 1
}

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export async function getUserPreferences(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('bible_version, exam_mode')
    .eq('id', userId)
    .single()
  return {
    bibleVersion: data?.bible_version ?? 'web',
    examMode: data?.exam_mode ?? false
  }
}

async function prefetchVerses(userId, startDay, bibleVersion, examMode) {
  const list = getFlatList(examMode ? EXAM_PLANS : STUDENT_PLANS)
  const rows = []
  for (let d = startDay; d < startDay + 7; d++) {
    const ref = list[(d - 1) % list.length]
    try {
      const url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=${bibleVersion}`
      const res = await fetch(url)
      const json = await res.json()
      rows.push({
        user_id: userId,
        journey_day: d,
        verse_reference: json.reference,
        verse_text: json.text.trim().replace(/\n/g, ' '),
        bible_version: bibleVersion,
      })
    } catch {
      // skip on network error
    }
  }
  if (rows.length > 0) {
    await supabase
      .from('user_verses')
      .upsert(rows, { onConflict: 'user_id,journey_day' })
  }
}

export async function getTodayVerse(user, bibleVersion = 'web', examMode = false) {
  const journeyDay = getJourneyDay(user)
  const list = getFlatList(examMode ? EXAM_PLANS : STUDENT_PLANS)
  const expectedRef = list[(journeyDay - 1) % list.length]

  // 1. Check localStorage first — works instantly offline
  const local = getLocalVerse(user.id, journeyDay)
  if (local && local.bible_version === bibleVersion && local.verse_reference === expectedRef) {
    return { journeyDay, verse_reference: local.verse_reference, verse_text: local.verse_text }
  }

  // 2. Try Supabase cache
  try {
    const { data: cached } = await supabase
      .from('user_verses')
      .select('verse_reference, verse_text, bible_version')
      .eq('user_id', user.id)
      .eq('journey_day', journeyDay)
      .single()

    if (cached && cached.bible_version === bibleVersion && cached.verse_reference === expectedRef) {
      setLocalVerse(user.id, journeyDay, cached)
      return { journeyDay, verse_reference: cached.verse_reference, verse_text: cached.verse_text }
    }

    // 3. Version changed or no Supabase cache — fetch from API
    await prefetchVerses(user.id, journeyDay, bibleVersion, examMode)

    const { data } = await supabase
      .from('user_verses')
      .select('verse_reference, verse_text')
      .eq('user_id', user.id)
      .eq('journey_day', journeyDay)
      .single()

    if (data) {
      setLocalVerse(user.id, journeyDay, { ...data, bible_version: bibleVersion })
      return { journeyDay, ...data }
    }
  } catch {
    // Offline and no Supabase — return whatever localStorage has regardless of version
    if (local) {
      return { journeyDay, verse_reference: local.verse_reference, verse_text: local.verse_text }
    }
  }

  return null
}

// Convenience: fetches the user's saved translation preference then gets the verse
export async function getTodayVerseForUser(user) {
  const prefs = await getUserPreferences(user.id)
  return getTodayVerse(user, prefs.bibleVersion, prefs.examMode)
}

// Returns { streak, totalEntries } based on actual logged entries.
// Streak = consecutive calendar days (in local timezone) ending today or yesterday.
export async function getStreakAndCount(userId) {
  const { data, count } = await supabase
    .from('entries')
    .select('created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!data || data.length === 0) {
    const recentDays = []
    const d = new Date()
    for (let i = 6; i >= 0; i--) {
      const pastDate = new Date(d)
      pastDate.setDate(d.getDate() - i)
      recentDays.push({
         label: ['S','M','T','W','T','F','S'][pastDate.getDay()],
         filled: false
      })
    }
    return { streak: 0, totalEntries: 0, recentDays }
  }

  const toDay = (d) => new Date(d).toLocaleDateString('en-CA') // YYYY-MM-DD local

  const uniqueDates = [...new Set(data.map((e) => toDay(e.created_at)))].sort(
    (a, b) => b.localeCompare(a)
  )

  const today = toDay(new Date())
  const yesterday = toDay(new Date(Date.now() - 86_400_000))

  // Streak only stays alive if the user logged today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    const recentDays = []
    const d = new Date()
    for (let i = 6; i >= 0; i--) {
      const pastDate = new Date(d)
      pastDate.setDate(d.getDate() - i)
      recentDays.push({
         label: ['S','M','T','W','T','F','S'][pastDate.getDay()],
         filled: uniqueDates.includes(toDay(pastDate))
      })
    }
    return { streak: 0, totalEntries: count ?? data.length, recentDays }
  }

  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1])
    const curr = new Date(uniqueDates[i])
    const diff = Math.round((prev - curr) / 86_400_000)
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }

  const recentDays = []
  const d = new Date()
  for (let i = 6; i >= 0; i--) {
    const pastDate = new Date(d)
    pastDate.setDate(d.getDate() - i)
    recentDays.push({
       label: ['S','M','T','W','T','F','S'][pastDate.getDay()],
       filled: uniqueDates.includes(toDay(pastDate))
    })
  }

  return { streak, totalEntries: count ?? data.length, recentDays }
}

export function getCurrentPlanInfo(user, examMode = false) {
  const journeyDay = getJourneyDay(user)
  const plans = examMode ? EXAM_PLANS : STUDENT_PLANS
  
  // Find which plan we are currently in based on journeyDay
  // Since plans can theoretically have different lengths (though all are 5 here),
  // we can iterate to find the current plan.
  
  const totalVerses = getFlatList(plans).length
  const currentOverallDay = ((journeyDay - 1) % totalVerses) + 1
  
  let dayAccumulator = 0
  for (const plan of plans) {
    if (currentOverallDay <= dayAccumulator + plan.verses.length) {
      return {
        title: plan.title,
        currentDay: currentOverallDay - dayAccumulator,
        totalDays: plan.verses.length
      }
    }
    dayAccumulator += plan.verses.length
  }
  
  // Fallback
  return { title: plans[0].title, currentDay: 1, totalDays: 5 }
}
