import { supabase } from './supabase'

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export async function subscribeToPush(userId) {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!key) return

  try {
    const reg = await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })
    }
    await supabase.from('push_subscriptions').upsert(
      { user_id: userId, subscription: sub.toJSON(), updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  } catch (err) {
    console.warn('Push subscribe failed:', err)
  }
}

export async function sendPushToUser(recipientId, title, body, url = '/community?tab=partners') {
  try {
    const { data } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', recipientId)
      .single()

    if (!data?.subscription) return

    const res = await fetch('/api/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: data.subscription, title, body, url }),
    })

    if (res.ok) {
      const json = await res.json()
      if (json.expired) {
        // Clean up stale subscription
        await supabase.from('push_subscriptions').delete().eq('user_id', recipientId)
      }
    }
  } catch {
    // Push is best-effort — never block the main action
  }
}

export async function notifyUser(recipientId, type, title, body, url = '/community?tab=partners') {
  await supabase.from('notifications').insert({
    user_id: recipientId,
    type,
    title,
    body,
    url,
    is_read: false,
  })
  sendPushToUser(recipientId, title, body, url) // fire-and-forget
}
