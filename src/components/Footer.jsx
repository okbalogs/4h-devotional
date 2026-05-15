import Link from "next/link"

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h3>Editorial Devotion</h3>
          <p>
            © {new Date().getFullYear()} ECWA Media Corp. Designed for Christ.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>4H DAILY SHELF</h4>
            <Link href="/explore">Explore Method</Link>
            <Link href="/signup">Start Devotion</Link>
          </div>
          <div className="footer-col">
            <h4>CLASSES</h4>
            <Link href="/courses">All Courses</Link>
            <Link href="/instructors">Instructors</Link>
          </div>
          <div className="footer-col">
            <h4>COMMUNITY</h4>
            <Link href="/fellowship">Fellowship</Link>
            <Link href="/support">Support</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Service</Link>
      </div>
    </footer>
  )
}
