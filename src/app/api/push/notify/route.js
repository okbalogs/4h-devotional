import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function POST(req) {
  try {
    const { subscription, title, body, url } = await req.json()
    if (!subscription) return Response.json({ ok: true })

    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, url })
    )
    return Response.json({ ok: true })
  } catch (err) {
    // 410 Gone = subscription expired/unsubscribed — caller should clean up
    return Response.json({ ok: false, expired: err.statusCode === 410 }, { status: 200 })
  }
}
