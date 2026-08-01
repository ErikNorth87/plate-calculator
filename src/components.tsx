import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

const PLATE_COLORS: Record<string, string> = {
  '45': '#2f6fdb',
  '35': '#e2b93b',
  '25': '#3e9a55',
  '15': '#1a1d21',
  '10': '#1a1d21',
  '5': '#8a9199',
  '2.5': '#8a9199',
}

const PLATE_SIZES: Record<string, { height: number; width: number }> = {
  '45': { height: 148, width: 28 },
  '35': { height: 128, width: 26 },
  '25': { height: 108, width: 24 },
  '15': { height: 88, width: 22 },
  '10': { height: 74, width: 20 },
  '5': { height: 58, width: 18 },
  '2.5': { height: 44, width: 16 },
}

interface BarbellProps {
  plates: number[]
  barWeight: number
  unlabeledCount?: number
  title: string
  totalWeight: number
}

export function BarbellDiagram({
  plates,
  barWeight,
  unlabeledCount = 0,
  title,
  totalWeight,
}: BarbellProps) {
  const side = (reverse: boolean) => {
    const values = reverse ? [...plates].reverse() : plates
    return values.map((plate, index) => {
      const originalIndex = reverse ? plates.length - 1 - index : index
      const isBase = originalIndex < unlabeledCount
      const size = PLATE_SIZES[String(plate)] ?? { height: 60, width: 18 }
      const isYellow = plate === 35 && !isBase
      return (
        <div
          className={`plate${isBase ? ' plate-base' : ''}`}
          key={`${plate}-${index}`}
          style={{
            background: isBase ? '#c5c9ce' : (PLATE_COLORS[String(plate)] ?? '#8a9199'),
            height: `${size.height}px`,
            width: `${size.width}px`,
            color: isYellow ? '#101820' : '#fff',
            textShadow: isYellow ? 'none' : '0 1px 2px #000',
          }}
          aria-label={`${plate} pound plate${isBase ? ' (base)' : ''}`}
        >
          {!isBase && <span>{plate}</span>}
        </div>
      )
    })
  }

  return (
    <section className="barbell-card">
      <div className="barbell-heading">
        <strong>{title}</strong>
        <span>{totalWeight} lb</span>
      </div>
      <div className="barbell" aria-label={`${title}: ${totalWeight} pounds`}>
        <div className="sleeve left">{side(true)}</div>
        <div className="bar">
          <span>{barWeight} lb bar</span>
        </div>
        <div className="sleeve right">{side(false)}</div>
      </div>
      <div className="plate-list">
        Per side: {plates.length ? plates.map((plate) => `${plate} lb`).join(' + ') : 'bar only'}
      </div>
    </section>
  )
}

export function ShareQr({ url }: { url: string }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    QRCode.toDataURL(url, { width: 320, margin: 1, errorCorrectionLevel: 'M' }).then(setSrc)
  }, [url])

  return src ? <img className="share-qr" src={src} alt="QR code to open Plate Calculator" /> : null
}

export function Header({
  title,
  onBack,
  action,
}: {
  title: string
  onBack?: () => void
  action?: React.ReactNode
}) {
  return (
    <header className="app-header">
      {onBack ? (
        <button className="icon-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
      ) : (
        <div className="header-spacer" />
      )}
      <h1>{title}</h1>
      <div className="header-action">{action}</div>
    </header>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="empty-state">{children}</div>
}
