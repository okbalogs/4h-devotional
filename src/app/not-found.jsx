import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">📖</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-text">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div className="not-found-actions">
          <Link href="/" className="btn-primary">Return Home</Link>
          <Link href="/explore" className="btn-outline">Explore the 4H Method</Link>
        </div>
      </div>
    </main>
  )
}
