const VERSE_KEY = (userId, journeyDay) => `verse_${userId}_${journeyDay}`
const PENDING_KEY = 'pending_entries'

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
