const VERSE_KEY    = (uid, day) => `verse_${uid}_${day}`
const PENDING_KEY  = 'pending_entries'
const ENTRIES_KEY  = (uid) => `entries_${uid}`
const PROFILE_KEY  = (uid) => `profile_${uid}`
const HIGHLIGHTS_KEY = (uid, verseRef) => `highlights_${uid}_${verseRef}`

// ─── Highlights ───

export function getLocalHighlights(uid, verseRef) {
  try {
    const raw = localStorage.getItem(HIGHLIGHTS_KEY(uid, verseRef))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalHighlight(uid, verseRef, highlight) {
  try {
    const highlights = getLocalHighlights(uid, verseRef)
    const newHighlight = {
      ...highlight,
      id: highlight.id || `hl_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      created_at: new Date().toISOString()
    }
    // Remove if there's an existing highlight that overlaps exactly, or just append
    highlights.push(newHighlight)
    localStorage.setItem(HIGHLIGHTS_KEY(uid, verseRef), JSON.stringify(highlights))
    return newHighlight
  } catch {
    return null
  }
}

export function deleteLocalHighlight(uid, verseRef, highlightId) {
  try {
    const highlights = getLocalHighlights(uid, verseRef)
    const filtered = highlights.filter(h => h.id !== highlightId)
    localStorage.setItem(HIGHLIGHTS_KEY(uid, verseRef), JSON.stringify(filtered))
  } catch {}
}

// ─── Verse cache ───

export function getLocalVerse(userId, journeyDay) {
  try {
    const raw = localStorage.getItem(VERSE_KEY(userId, journeyDay))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setLocalVerse(userId, journeyDay, data) {
  try {
    localStorage.setItem(VERSE_KEY(userId, journeyDay), JSON.stringify(data))
  } catch {
    // storage quota exceeded — not critical
  }
}

// ─── Pending (offline) entries ───

export function getPendingEntries() {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function queueEntry(entry) {
  try {
    const pending = getPendingEntries()
    pending.push({ ...entry, _offlineId: `${Date.now()}_${Math.random()}` })
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
    return true
  } catch {
    return false
  }
}

export function removePendingEntry(offlineId) {
  try {
    const filtered = getPendingEntries().filter((e) => e._offlineId !== offlineId)
    localStorage.setItem(PENDING_KEY, JSON.stringify(filtered))
  } catch {}
}

export function hasPendingEntries() {
  return getPendingEntries().length > 0
}

// ─── Entries (primary storage, no Firestore) ───

export function getLocalEntries(uid) {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY(uid))
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveLocalEntry(uid, entry) {
  try {
    const entries = getLocalEntries(uid)
    const newEntry = {
      ...entry,
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      created_at: entry.created_at || new Date().toISOString(),
    }
    entries.unshift(newEntry) // newest first
    localStorage.setItem(ENTRIES_KEY(uid), JSON.stringify(entries))
    return newEntry
  } catch { return null }
}

export function deleteLocalEntry(uid, id) {
  try {
    const filtered = getLocalEntries(uid).filter(e => e.id !== id)
    localStorage.setItem(ENTRIES_KEY(uid), JSON.stringify(filtered))
  } catch {}
}

// ─── Profile ───

const DEFAULT_PROFILE = {
  bible_version: 'web',
  exam_mode: false,
  avatar_url: null,
  church: '',
  academic_level: '',
  reminders_enabled: true,
  reminder_time: '06:00',
  public_profile: false,
  weekly_summary: true,
  community_prayers: false,
}

export function getLocalProfile(uid) {
  try {
    const raw = localStorage.getItem(PROFILE_KEY(uid))
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : { ...DEFAULT_PROFILE }
  } catch { return { ...DEFAULT_PROFILE } }
}

export function setLocalProfile(uid, updates) {
  try {
    const current = getLocalProfile(uid)
    const merged = { ...current, ...updates, updated_at: new Date().toISOString() }
    localStorage.setItem(PROFILE_KEY(uid), JSON.stringify(merged))
    return merged
  } catch { return null }
}
