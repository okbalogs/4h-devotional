import { supabase } from './supabase'
import { getLocalVerse, setLocalVerse } from './offlineStorage'

const VERSE_LIST = [
  "Psalm 23:1-3", "John 3:16", "Proverbs 3:5-6", "Romans 8:28",
  "Philippians 4:6-7", "Isaiah 40:31", "Jeremiah 29:11", "Matthew 6:33",
  "Psalm 46:1", "Joshua 1:9", "Romans 12:1-2", "Galatians 5:22-23",
  "Ephesians 6:10-11", "1 Corinthians 13:4-7", "James 1:2-4", "Hebrews 11:1",
  "Matthew 5:3-5", "Psalm 119:105", "Isaiah 41:10", "2 Timothy 3:16-17",
  "Romans 5:1-2", "Colossians 3:23-24", "Matthew 11:28-30", "Psalm 139:14",
  "1 Peter 5:7", "John 15:5", "Romans 6:23", "Psalm 27:1",
  "Isaiah 55:8-9", "Matthew 28:19-20", "John 14:6", "Acts 1:8",
  "Romans 3:23", "Ephesians 2:8-9", "Philippians 4:13", "Psalm 37:4",
  "Proverbs 4:23", "Isaiah 26:3", "Luke 6:31", "John 10:10",
  "Romans 8:1", "2 Corinthians 5:17", "Galatians 2:20", "Ephesians 4:32",
  "Colossians 1:15-17", "1 Thessalonians 5:16-18", "2 Timothy 1:7", "Hebrews 4:16",
  "James 1:22", "1 John 1:9", "Revelation 3:20", "Psalm 51:10",
  "Proverbs 16:3", "Isaiah 43:2", "Matthew 5:14-16", "John 8:32",
  "Acts 4:12", "Romans 10:9", "1 Corinthians 10:13", "Ephesians 3:20",
  "Philippians 2:3-4", "Colossians 4:2", "1 Timothy 6:6", "Hebrews 12:1-2",
  "James 4:7", "1 Peter 2:9", "Psalm 34:8", "Proverbs 22:6",
  "Isaiah 53:5", "Matthew 6:9-13", "John 16:33", "Romans 8:38-39",
  "1 Corinthians 15:57", "Ephesians 5:1-2", "Philippians 1:6", "Colossians 3:2",
  "2 Thessalonians 3:3", "Hebrews 13:8", "James 5:16", "1 Peter 3:15",
  "1 John 4:7-8", "Psalm 91:1-2", "Proverbs 18:24", "Isaiah 58:6-7",
  "Matthew 22:37-39", "John 1:1-3", "Romans 12:9-10", "1 Corinthians 6:19-20",
  "Galatians 6:9", "Ephesians 1:3-4", "Philippians 3:13-14", "Colossians 3:12-14",
  "2 Timothy 2:15", "Hebrews 10:24-25", "James 2:17", "1 Peter 4:10",
  "Revelation 21:4", "Psalm 1:1-3", "Proverbs 31:25", "Isaiah 9:6",
]

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

export async function getUserBibleVersion(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('bible_version')
    .eq('id', userId)
    .single()
  return data?.bible_version ?? 'web'
}

async function prefetchVerses(userId, startDay, bibleVersion) {
  const rows = []
  for (let d = startDay; d < startDay + 7; d++) {
    const ref = VERSE_LIST[(d - 1) % VERSE_LIST.length]
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

export async function getTodayVerse(user, bibleVersion = 'web') {
  const journeyDay = getJourneyDay(user)

  // 1. Check localStorage first — works instantly offline
  const local = getLocalVerse(user.id, journeyDay)
  if (local && local.bible_version === bibleVersion) {
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

    if (cached && cached.bible_version === bibleVersion) {
      setLocalVerse(user.id, journeyDay, cached)
      return { journeyDay, verse_reference: cached.verse_reference, verse_text: cached.verse_text }
    }

    // 3. Version changed or no Supabase cache — fetch from API
    await prefetchVerses(user.id, journeyDay, bibleVersion)

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
  const bibleVersion = await getUserBibleVersion(user.id)
  return getTodayVerse(user, bibleVersion)
}
