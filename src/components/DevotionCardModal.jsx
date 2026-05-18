"use client"
import { useRef } from 'react'

const PILLARS = [
  { key: 'hear', label: 'Head', sub: 'H1', icon: '⚙' },
  { key: 'heed', label: 'Heart', sub: 'H2', icon: '♥' },
  { key: 'hold', label: 'Hand', sub: 'H3', icon: '✋' },
  { key: 'help', label: 'Help', sub: 'H4', icon: '☺' },
]

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = (text || '').split(' ')
  let line = ''
  let drawnLines = 0

  for (let n = 0; n <= words.length; n++) {
    const testLine = n < words.length ? line + words[n] + ' ' : line
    if ((ctx.measureText(testLine).width > maxWidth && n > 0) || n === words.length) {
      if (maxLines && drawnLines >= maxLines - 1 && n < words.length) {
        const truncated = line.trimEnd()
        ctx.fillText(truncated.length > 3 ? truncated.slice(0, -3) + '…' : truncated, x, y)
        drawnLines++
        break
      }
      ctx.fillText(line.trimEnd(), x, y)
      drawnLines++
      y += lineHeight
      line = n < words.length ? words[n] + ' ' : ''
    } else {
      line = testLine
    }
  }
  return drawnLines
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawCard(canvas, entry, formattedDate) {
  const W = 1080
  const H = 1350
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#fdf6ec')
  bg.addColorStop(0.5, '#faf0e4')
  bg.addColorStop(1, '#f5e6d3')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Subtle texture lines (decorative)
  ctx.strokeStyle = 'rgba(157,79,20,0.04)'
  ctx.lineWidth = 1
  for (let i = 0; i < H; i += 40) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke()
  }

  // Top accent bar
  const topGrad = ctx.createLinearGradient(0, 0, W, 0)
  topGrad.addColorStop(0, '#9d4f14')
  topGrad.addColorStop(1, '#c0783a')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, W, 10)

  // Header area
  ctx.fillStyle = '#9d4f14'
  ctx.font = 'bold 26px Georgia, serif'
  ctx.letterSpacing = '4px'
  ctx.fillText('✦  SELAH', 60, 80)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = '#c0a080'
  ctx.font = '22px Arial, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(formattedDate, W - 60, 80)
  ctx.textAlign = 'left'

  // Thin separator line
  ctx.strokeStyle = '#e8d8c4'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(60, 105); ctx.lineTo(W - 60, 105); ctx.stroke()

  // Scripture reference pill
  const refY = 140
  if (entry.scripture_reference) {
    const refText = entry.scripture_reference.toUpperCase()
    ctx.font = 'bold 20px Arial, sans-serif'
    const refW = ctx.measureText(refText).width + 32
    roundRect(ctx, 60, refY, refW, 36, 18)
    ctx.fillStyle = '#f5e6d3'
    ctx.fill()
    ctx.strokeStyle = '#e8cfa8'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = '#9d4f14'
    ctx.fillText(refText, 76, refY + 24)
  }

  // Title / verse text (large serif)
  ctx.fillStyle = '#2a1f14'
  ctx.font = '52px Georgia, serif'
  const titleY = entry.scripture_reference ? 250 : 200
  const titleLines = wrapText(ctx, entry.title || 'Devotional Entry', 60, titleY, W - 120, 66, 3)

  // Decorative underline
  const underlineY = titleY + titleLines * 66 - 10
  ctx.strokeStyle = '#f5d1a5'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(60, underlineY); ctx.lineTo(160, underlineY); ctx.stroke()

  // 4H grid
  const gridTop = underlineY + 40
  const cellW = (W - 120 - 20) / 2
  const cellH = 260
  const cols = [60, 60 + cellW + 20]
  const rows = [gridTop, gridTop + cellH + 20]

  const pillarColors = ['#9d4f14', '#c0783a', '#7a4f28', '#4a7c59']

  PILLARS.forEach((pillar, i) => {
    const cx = cols[i % 2]
    const cy = rows[Math.floor(i / 2)]

    // Card background
    roundRect(ctx, cx, cy, cellW, cellH, 16)
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.65)' : 'rgba(253,246,236,0.8)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(232,216,196,0.7)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Accent left border
    ctx.fillStyle = pillarColors[i]
    roundRect(ctx, cx, cy, 5, cellH, 3)
    ctx.fill()

    // Icon circle
    const iconR = 22
    ctx.beginPath()
    ctx.arc(cx + 38, cy + 38, iconR, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(157,79,20,0.1)`
    ctx.fill()
    ctx.fillStyle = pillarColors[i]
    ctx.font = '22px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(pillar.icon, cx + 38, cy + 46)
    ctx.textAlign = 'left'

    // Label
    ctx.fillStyle = '#2a1f14'
    ctx.font = 'bold 28px Georgia, serif'
    ctx.fillText(pillar.label, cx + 72, cy + 44)

    // Sub label
    ctx.fillStyle = pillarColors[i]
    ctx.font = '18px Arial, sans-serif'
    ctx.fillText(pillar.sub.toUpperCase(), cx + 72, cy + 66)

    // Content text
    ctx.fillStyle = '#5a4a3a'
    ctx.font = '20px Arial, sans-serif'
    const content = entry[pillar.key] || ''
    if (content) {
      wrapText(ctx, content, cx + 20, cy + 100, cellW - 30, 28, 4)
    } else {
      ctx.fillStyle = '#bfae9e'
      ctx.font = 'italic 20px Arial, sans-serif'
      ctx.fillText('—', cx + 20, cy + 100)
    }
  })

  // Lingering thought banner
  if (entry.lingering_thought) {
    const bannerY = rows[1] + cellH + 36
    const bannerH = 100
    roundRect(ctx, 60, bannerY, W - 120, bannerH, 12)
    const bannerGrad = ctx.createLinearGradient(60, bannerY, W - 60, bannerY)
    bannerGrad.addColorStop(0, 'rgba(157,79,20,0.08)')
    bannerGrad.addColorStop(1, 'rgba(192,120,58,0.06)')
    ctx.fillStyle = bannerGrad
    ctx.fill()
    ctx.strokeStyle = 'rgba(232,216,196,0.8)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = '#7a4f28'
    ctx.font = 'italic 26px Georgia, serif'
    ctx.textAlign = 'center'
    wrapText(ctx, `“${entry.lingering_thought}”`, W / 2, bannerY + 42, W - 180, 34, 2)
    ctx.textAlign = 'left'
  }

  // Bottom separator
  ctx.strokeStyle = '#e8d8c4'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(60, H - 80); ctx.lineTo(W - 60, H - 80); ctx.stroke()

  // Footer
  ctx.fillStyle = '#c0a080'
  ctx.font = '22px Arial, sans-serif'
  ctx.fillText('4H Devotion · ECWA', 60, H - 46)
  ctx.textAlign = 'right'
  ctx.fillStyle = '#9d4f14'
  ctx.font = 'bold 22px Georgia, serif'
  ctx.fillText('✦ selah', W - 60, H - 46)
  ctx.textAlign = 'left'

  // Bottom accent bar
  ctx.fillStyle = topGrad
  ctx.fillRect(0, H - 10, W, 10)
}

export default function DevotionCardModal({ entry, formattedDate, onClose }) {
  const canvasRef = useRef(null)

  const handleDownload = () => {
    const canvas = canvasRef.current
    drawCard(canvas, entry, formattedDate)
    const link = document.createElement('a')
    const slug = (entry.scripture_reference || 'devotion').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    link.download = `selah-${slug}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const pillars = PILLARS.map((p) => ({ ...p, content: entry[p.key] }))

  return (
    <div className="dcard-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dcard-modal">
        <div className="dcard-modal-header">
          <span className="dcard-modal-title">Devotion Card</span>
          <button className="dcard-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Card preview */}
        <div className="dcard-preview">
          <div className="dcard-accent-bar" />

          <div className="dcard-top-row">
            <span className="dcard-brand">✦ SELAH</span>
            <span className="dcard-date">{formattedDate}</span>
          </div>

          <hr className="dcard-divider" />

          {entry.scripture_reference && (
            <span className="dcard-ref-pill">{entry.scripture_reference.toUpperCase()}</span>
          )}

          <h2 className="dcard-title">{entry.title || 'Devotional Entry'}</h2>
          <div className="dcard-underline" />

          <div className="dcard-grid">
            {pillars.map((p, i) => (
              <div key={p.key} className={`dcard-cell dcard-cell-${i}`}>
                <div className="dcard-cell-header">
                  <span className="dcard-cell-label">{p.label}</span>
                  <span className="dcard-cell-sub">{p.sub}</span>
                </div>
                <p className="dcard-cell-text">
                  {p.content || <em style={{ color: '#bfae9e' }}>—</em>}
                </p>
              </div>
            ))}
          </div>

          {entry.lingering_thought && (
            <div className="dcard-thought">
              &ldquo;{entry.lingering_thought}&rdquo;
            </div>
          )}

          <hr className="dcard-divider dcard-divider-bottom" />
          <div className="dcard-footer-row">
            <span className="dcard-footer-left">4H Devotion · ECWA</span>
            <span className="dcard-footer-right">✦ selah</span>
          </div>

          <div className="dcard-accent-bar dcard-accent-bar-bottom" />
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <button className="dcard-download-btn" onClick={handleDownload}>
          ⬇ Download Card
        </button>
      </div>
    </div>
  )
}
