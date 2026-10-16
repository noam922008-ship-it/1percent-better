// Share card — a 1080×1920 story image (streak + this week) drawn on a canvas, shared through
// the phone's share sheet (Instagram story, WhatsApp…) or downloaded when sharing files isn't
// supported (desktop). Nothing is uploaded: the image is made on the device.

export const CARD_W = 1080
export const CARD_H = 1920
export const APP_URL = 'prime-app-84fe0.web.app'

const C = { bg: '#09090b', panel: '#111317', text: '#F4F1E8', muted: '#A4A6AD', faint: '#71717A', gold: '#D9B34C', ok: '#3FAF7A' }
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Heebo, Arial, sans-serif'

/** The texts on the card, picked from copy (t.share) — pure, so it can be tested. */
export function cardTexts({ streak = 0, activeDays = 0, copy }) {
  const n = Math.max(0, Number(streak) || 0)
  return {
    big:      String(n),
    bigLabel: n === 1 ? copy.streakOne : copy.streakMany,
    week:     copy.week.replace('{n}', String(activeDays)),
    tagline:  copy.tagline,
    url:      APP_URL,
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * Draws the card. days: 7 booleans (Sunday first), dayLabels: 7 short labels.
 * rtl: Hebrew layout (days run right to left).
 */
export function drawShareCard(canvas, { texts, days = [], dayLabels = [], rtl = false }) {
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  ctx.direction = rtl ? 'rtl' : 'ltr'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Background with a soft gold glow
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)
  const glow = ctx.createRadialGradient(CARD_W / 2, 720, 40, CARD_W / 2, 720, 700)
  glow.addColorStop(0, 'rgba(217,179,76,0.28)')
  glow.addColorStop(1, 'rgba(217,179,76,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Brand
  ctx.fillStyle = C.gold
  ctx.font = `900 64px ${FONT}`
  ctx.fillText('PRIME', CARD_W / 2, 220)
  ctx.fillStyle = C.faint
  ctx.font = `600 38px ${FONT}`
  ctx.fillText(texts.tagline, CARD_W / 2, 300)

  // Streak
  ctx.font = `140px ${FONT}`
  ctx.fillText('🔥', CARD_W / 2, 560)
  ctx.fillStyle = C.text
  ctx.font = `900 300px ${FONT}`
  ctx.fillText(texts.big, CARD_W / 2, 820)
  ctx.fillStyle = C.muted
  ctx.font = `800 64px ${FONT}`
  ctx.fillText(texts.bigLabel, CARD_W / 2, 1010)

  // Week panel
  const px = 90, py = 1150, pw = CARD_W - 180, ph = 360
  ctx.fillStyle = C.panel
  roundRect(ctx, px, py, pw, ph, 48)
  ctx.fill()
  ctx.strokeStyle = 'rgba(217,179,76,0.35)'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.fillStyle = C.text
  ctx.font = `800 52px ${FONT}`
  ctx.fillText(texts.week, CARD_W / 2, py + 80)

  const size = 92, gap = 18
  const total = 7 * size + 6 * gap
  const startX = (CARD_W - total) / 2
  for (let i = 0; i < 7; i++) {
    const slot = rtl ? 6 - i : i
    const x = startX + slot * (size + gap)
    const y = py + 150
    const on = !!days[i]
    ctx.fillStyle = on ? 'rgba(63,175,122,0.25)' : 'rgba(255,255,255,0.05)'
    roundRect(ctx, x, y, size, size, 22)
    ctx.fill()
    ctx.strokeStyle = on ? 'rgba(63,175,122,0.7)' : 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 3
    ctx.stroke()
    if (on) {
      ctx.fillStyle = C.ok
      ctx.font = `900 52px ${FONT}`
      ctx.fillText('✓', x + size / 2, y + size / 2 + 2)
    }
    ctx.fillStyle = C.faint
    ctx.font = `700 34px ${FONT}`
    ctx.fillText(dayLabels[i] || '', x + size / 2, y + size + 44)
  }

  // Link
  ctx.fillStyle = C.gold
  ctx.font = `800 46px ${FONT}`
  ctx.fillText(texts.url, CARD_W / 2, CARD_H - 200)
  return canvas
}

const toBlob = canvas => new Promise(resolve => canvas.toBlob(resolve, 'image/png'))

/** Draws the card on an off-screen canvas and returns a PNG blob (or null). */
export async function makeCardBlob(opts) {
  try {
    const canvas = document.createElement('canvas')
    drawShareCard(canvas, opts)
    return await toBlob(canvas)
  } catch { return null }
}

/**
 * Shares a ready PNG blob through the share sheet, or downloads it. Make the blob before the tap:
 * iOS only allows navigator.share() right after a tap, with no slow work in between.
 * Returns 'shared' | 'downloaded' | 'cancelled' | 'failed'.
 */
export async function shareBlob(blob, { text, fileName = 'prime-streak.png' } = {}) {
  if (!blob) return 'failed'
  const file = typeof File === 'function' ? new File([blob], fileName, { type: 'image/png' }) : null

  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text })
      return 'shared'
    } catch (err) {
      return err?.name === 'AbortError' ? 'cancelled' : 'failed'
    }
  }

  try {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return 'downloaded'
  } catch { return 'failed' }
}
