"use client"
import { useRef } from 'react'

const PILLARS = [
  { key: 'hear', label: 'Head', sub: 'H1', icon: '⚙' },
  { key: 'heed', label: 'Heart', sub: 'H2', icon: '♥' },
  { key: 'hold', label: 'Hand', sub: 'H3', icon: '✋' },
  { key: 'help', label: 'Help', sub: 'H4', icon: '☺' },
]

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const paragraphs = (text || '').split('\n')
  let drawnLines = 0

  for (let p = 0; p < paragraphs.length; p++) {
    const paragraph = paragraphs[p]
    if (paragraph === '' && p < paragraphs.length - 1) {
      // Empty line (double return)
      y += lineHeight
      drawnLines++
      if (maxLines && drawnLines >= maxLines) break
      continue
    }

    const words = paragraph.split(' ')
    let line = ''

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const testWidth = ctx.measureText(testLine).width

      if (testWidth > maxWidth && n > 0) {
        if (maxLines && drawnLines >= maxLines - 1) {
          const truncated = line.trimEnd()
          ctx.fillText(truncated.length > 3 ? truncated.slice(0, -3) + '…' : truncated, x, y)
          drawnLines++
          return drawnLines
        }
        ctx.fillText(line.trimEnd(), x, y)
        drawnLines++
        y += lineHeight
        line = words[n] + ' '
        if (maxLines && drawnLines >= maxLines) return drawnLines
      } else {
        line = testLine
      }
    }

    if (line) {
      ctx.fillText(line.trimEnd(), x, y)
      drawnLines++
      y += lineHeight
      if (maxLines && drawnLines >= maxLines) break
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

function drawCard(canvas, entry, verseText, formattedDate) {
  const W = 1080
  const ctx = canvas.getContext('2d')

  // We need to calculate how much vertical space we need first.
  let cursorY = 150
  
  // Calculate verse height
  let verseLines = 0
  if (verseText) {
    ctx.font = 'italic 40px Georgia, serif'
    // Temporary dry run to measure lines
    verseLines = wrapText(ctx, verseText, 60, cursorY, W - 120, 54)
    cursorY += verseLines * 54 + 16
  }

  // Underline + Title
  cursorY += 24
  if (entry.title) {
    ctx.font = '28px Arial, sans-serif'
    const titleLines = wrapText(ctx, entry.title, 60, cursorY, W - 120, 38)
    cursorY += titleLines * 38 + 16
  }
  cursorY += 16

  // Now calculate cell heights for the 4H quadrants
  const cellW = (W - 120 - 20) / 2
  ctx.font = '19px Arial, sans-serif'
  
  // Helper to pre-calculate heights for quadrants
  const quadrantLineCounts = PILLARS.map(pillar => {
    const content = entry[pillar.key] || ''
    if (!content) return 0
    return wrapText(ctx, content, 0, 0, cellW - 40, 26) // dry run measuring width
  })

  // The grid has two rows. Find max height needed for each row.
  const row1MaxLines = Math.max(quadrantLineCounts[0], quadrantLineCounts[1])
  const row2MaxLines = Math.max(quadrantLineCounts[2], quadrantLineCounts[3])
  
  // Cell base height (header space is around 95px, padding bottom 20px)
  const cell1H = Math.max(200, 95 + row1MaxLines * 26 + 20)
  const cell2H = Math.max(200, 95 + row2MaxLines * 26 + 20)

  const gridRow1Y = cursorY
  const gridRow2Y = gridRow1Y + cell1H + 20
  const gridBottomY = gridRow2Y + cell2H

  // Lingering thought calculation
  let lingeringY = gridBottomY + 32
  let lingeringH = 90
  let lingeringLines = 0
  if (entry.lingering_thought) {
    ctx.font = 'italic 24px Georgia, serif'
    lingeringLines = wrapText(ctx, `"${entry.lingering_thought}"`, 0, 0, W - 180, 32)
    lingeringH = Math.max(90, 30 + lingeringLines * 32 + 30)
  }

  // Calculate final height: lingering bottom + padding + footer (120px)
  const finalH = lingeringY + lingeringH + 140
  canvas.height = finalH
  canvas.width = W

  // --- Start Drawing ---
  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, finalH)
  bg.addColorStop(0, '#fdf6ec')
  bg.addColorStop(0.5, '#faf0e4')
  bg.addColorStop(1, '#f5e6d3')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, finalH)

  // Subtle texture lines
  ctx.strokeStyle = 'rgba(157,79,20,0.04)'
  ctx.lineWidth = 1
  for (let i = 0; i < finalH; i += 40) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke()
  }

  // Top accent bar
  const topGrad = ctx.createLinearGradient(0, 0, W, 0)
  topGrad.addColorStop(0, '#9d4f14')
  topGrad.addColorStop(1, '#c0783a')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, W, 10)

  // Header
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

  // Separator
  ctx.strokeStyle = '#e8d8c4'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(60, 105); ctx.lineTo(W - 60, 105); ctx.stroke()

  // Scripture reference pill
  cursorY = 150
  if (entry.scripture_reference) {
    const refText = entry.scripture_reference.toUpperCase()
    ctx.font = 'bold 20px Arial, sans-serif'
    const refW = ctx.measureText(refText).width + 32
    roundRect(ctx, 60, cursorY, refW, 36, 18)
    ctx.fillStyle = '#f5e6d3'
    ctx.fill()
    ctx.strokeStyle = '#e8cfa8'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = '#9d4f14'
    ctx.fillText(refText, 76, cursorY + 24)
    cursorY += 56
  }

  // Verse text (large italic serif)
  if (verseText) {
    ctx.fillStyle = '#2a1f14'
    ctx.font = 'italic 40px Georgia, serif'
    wrapText(ctx, verseText, 60, cursorY, W - 120, 54)
    cursorY += verseLines * 54 + 16
  }

  // Decorative underline after verse
  ctx.strokeStyle = '#f5d1a5'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(60, cursorY); ctx.lineTo(160, cursorY); ctx.stroke()
  cursorY += 24

  // Entry title (subtitle style)
  if (entry.title) {
    ctx.fillStyle = '#7a4f28'
    ctx.font = '28px Arial, sans-serif'
    wrapText(ctx, entry.title, 60, cursorY, W - 120, 38)
    cursorY += (entry.title.split('\n').length || 1) * 38 + 16
  }

  // 4H grid drawing
  const cols = [60, 60 + cellW + 20]
  const pillarColors = ['#9d4f14', '#c0783a', '#7a4f28', '#4a7c59']

  PILLARS.forEach((pillar, i) => {
    const cx = cols[i % 2]
    const cy = i < 2 ? gridRow1Y : gridRow2Y
    const currentCellH = i < 2 ? cell1H : cell2H

    roundRect(ctx, cx, cy, cellW, currentCellH, 16)
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.65)' : 'rgba(253,246,236,0.8)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(232,216,196,0.7)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = pillarColors[i]
    roundRect(ctx, cx, cy, 5, currentCellH, 3)
    ctx.fill()

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

    ctx.fillStyle = '#2a1f14'
    ctx.font = 'bold 26px Georgia, serif'
    ctx.fillText(pillar.label, cx + 72, cy + 42)

    ctx.fillStyle = pillarColors[i]
    ctx.font = '17px Arial, sans-serif'
    ctx.fillText(pillar.sub.toUpperCase(), cx + 72, cy + 62)

    ctx.fillStyle = '#5a4a3a'
    ctx.font = '19px Arial, sans-serif'
    const content = entry[pillar.key] || ''
    if (content) {
      wrapText(ctx, content, cx + 20, cy + 95, cellW - 40, 26)
    } else {
      ctx.fillStyle = '#bfae9e'
      ctx.font = 'italic 19px Arial, sans-serif'
      ctx.fillText('—', cx + 20, cy + 95)
    }
  })

  // Lingering thought
  if (entry.lingering_thought) {
    roundRect(ctx, 60, lingeringY, W - 120, lingeringH, 12)
    const bannerGrad = ctx.createLinearGradient(60, lingeringY, W - 60, lingeringY)
    bannerGrad.addColorStop(0, 'rgba(157,79,20,0.08)')
    bannerGrad.addColorStop(1, 'rgba(192,120,58,0.06)')
    ctx.fillStyle = bannerGrad
    ctx.fill()
    ctx.strokeStyle = 'rgba(232,216,196,0.8)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = '#7a4f28'
    ctx.font = 'italic 24px Georgia, serif'
    ctx.textAlign = 'center'
    wrapText(ctx, `"${entry.lingering_thought}"`, W / 2, lingeringY + 45, W - 180, 32)
    ctx.textAlign = 'left'
  }

  // Footer separator
  ctx.strokeStyle = '#e8d8c4'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(60, finalH - 80); ctx.lineTo(W - 60, finalH - 80); ctx.stroke()

  ctx.fillStyle = '#c0a080'
  ctx.font = '22px Arial, sans-serif'
  ctx.fillText('4H Devotion · ECWA', 60, finalH - 46)
  ctx.textAlign = 'right'
  ctx.fillStyle = '#9d4f14'
  ctx.font = 'bold 22px Georgia, serif'
  ctx.fillText('✦ selah', W - 60, finalH - 46)
  ctx.textAlign = 'left'

  ctx.fillStyle = topGrad
  ctx.fillRect(0, finalH - 10, W, 10)
}

export default function DevotionCardModal({ entry, verseText, formattedDate, onClose }) {
  const canvasRef = useRef(null)

  const handleDownload = () => {
    const canvas = canvasRef.current
    drawCard(canvas, entry, verseText, formattedDate)
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

          {verseText && (
            <p className="dcard-verse-text">&ldquo;{verseText}&rdquo;</p>
          )}

          <div className="dcard-underline" />

          {entry.title && (
            <p className="dcard-subtitle">{entry.title}</p>
          )}

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
