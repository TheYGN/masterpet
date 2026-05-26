'use client'

import { useState, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

// ── Types ─────────────────────────────────────────────────────────────────────

type AspectKey = 'original' | '1:1' | '16:9' | '9:16' | 'free'
type Phase = 'idle' | 'cropping' | 'uploading'

const ASPECT_OPTIONS: Array<{ key: AspectKey; label: string }> = [
  { key: 'original', label: 'מקורי' },
  { key: '1:1', label: '1:1' },
  { key: '16:9', label: '16:9' },
  { key: '9:16', label: '9:16' },
  { key: 'free', label: 'חופשי' },
]

function resolveAspect(key: AspectKey, naturalAspect: number): number | undefined {
  if (key === 'original') return naturalAspect
  if (key === '1:1') return 1
  if (key === '16:9') return 16 / 9
  if (key === '9:16') return 9 / 16
  return undefined // free
}

// ── Canvas helpers ────────────────────────────────────────────────────────────

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function getNaturalAspect(src: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve(img.naturalWidth / img.naturalHeight)
    img.src = src
  })
}

async function cropToWebP(src: string, px: Area): Promise<Blob> {
  const img = new window.Image()
  img.src = src
  await new Promise<void>((resolve) => { img.onload = () => resolve() })

  const canvas = document.createElement('canvas')
  canvas.width = px.width
  canvas.height = px.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas context unavailable')

  ctx.drawImage(img, px.x, px.y, px.width, px.height, 0, 0, px.width, px.height)

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/webp',
      0.85,
    ),
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface ProductImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
}

export function ProductImageUpload({ value, onChange }: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('idle')
  const [imageSrc, setImageSrc] = useState('')
  const [naturalAspect, setNaturalAspect] = useState(1)
  const [selectedAspect, setSelectedAspect] = useState<AspectKey>('1:1')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [error, setError] = useState<string | null>(null)

  const openPicker = () => fileInputRef.current?.click()

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('יש לבחור קובץ תמונה'); return }
    if (file.size > 10 * 1024 * 1024) { setError('הקובץ גדול מדי (מקסימום 10MB)'); return }

    setError(null)
    const src = await readFileAsDataUrl(file)
    const aspect = await getNaturalAspect(src)
    setImageSrc(src)
    setNaturalAspect(aspect)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setSelectedAspect('1:1')
    setPhase('cropping')
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return
    setPhase('uploading')
    setError(null)
    try {
      const blob = await cropToWebP(imageSrc, croppedAreaPixels)
      const fd = new FormData()
      fd.append('file', blob, 'product.webp')

      const res = await fetch('/api/upload/product-image', { method: 'POST', body: fd })
      const json = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !json.url) throw new Error(json.error ?? 'שגיאת העלאה')

      onChange(json.url)
      setPhase('idle')
      setImageSrc('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהעלאה')
      setPhase('cropping')
    }
  }, [imageSrc, croppedAreaPixels, onChange])

  const handleCancel = useCallback(() => {
    setPhase('idle')
    setImageSrc('')
    setError(null)
  }, [])

  // ── Idle state ────────────────────────────────────────────────────────────

  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (phase === 'idle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {value ? (
          // Preview + actions
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 16px', borderRadius: 12,
            background: 'var(--md-surface-container-low)',
            border: '1px solid var(--md-outline-variant)',
          }}>
            <img
              src={value}
              alt="תמונת מוצר"
              onClick={() => setLightboxOpen(true)}
              style={{
                width: 72, height: 72, objectFit: 'cover',
                borderRadius: 8, flexShrink: 0,
                background: 'var(--md-surface-container)',
                cursor: 'zoom-in',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--md-on-surface)', fontWeight: 500, marginBottom: 8 }}>
                תמונה הועלתה
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={openPicker}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 999,
                    background: 'var(--md-surface-container)',
                    border: '1px solid var(--md-outline-variant)',
                    color: 'var(--md-on-surface)', fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <span className="ms" style={{ fontSize: 15 }}>swap_horiz</span>
                  החלף
                </button>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 999,
                    background: 'transparent',
                    border: '1px solid var(--md-outline-variant)',
                    color: 'var(--md-error)', fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <span className="ms" style={{ fontSize: 15 }}>delete_outline</span>
                  הסר
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Drop zone
          <button
            type="button"
            onClick={openPicker}
            style={{
              width: '100%', padding: '28px 20px', borderRadius: 12,
              background: 'var(--md-surface-container-lowest)',
              border: '2px dashed var(--md-outline-variant)',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}
          >
            <span className="ms" style={{
              fontSize: 36, color: 'var(--md-on-surface-variant)', opacity: 0.6,
            }}>
              add_photo_alternate
            </span>
            <span style={{ fontSize: 13, color: 'var(--md-on-surface)', fontWeight: 500 }}>
              לחץ לבחירת תמונה
            </span>
            <span style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
              JPEG · PNG · WebP — עד 10MB
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />

        {error && <ErrorBanner message={error} />}

        {/* Lightbox */}
        {lightboxOpen && value && (
          <div
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.82)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'zoom-out',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'relative', cursor: 'default' }}
            >
              <img
                src={value}
                alt="תמונת מוצר"
                style={{
                  maxWidth: 'min(90vw, 900px)',
                  maxHeight: '88vh',
                  objectFit: 'contain',
                  borderRadius: 12,
                  boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                  display: 'block',
                }}
              />
              <button
                onClick={() => setLightboxOpen(false)}
                style={{
                  position: 'absolute', top: -16, insetInlineEnd: -16,
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(30,30,30,0.85)', border: '1.5px solid rgba(255,255,255,0.18)',
                  color: '#fff', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }}
              >
                <span className="ms" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Cropping / uploading state ────────────────────────────────────────────

  const isBusy = phase === 'uploading'
  const activeAspect = resolveAspect(selectedAspect, naturalAspect)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Crop canvas */}
      <div style={{
        position: 'relative', height: 320, borderRadius: 12, overflow: 'hidden',
        background: '#111',
      }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={activeAspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          style={{
            containerStyle: { borderRadius: 12 },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="ms" style={{ fontSize: 16, color: 'var(--md-on-surface-variant)' }}>zoom_out</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          disabled={isBusy}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--md-primary)' }}
        />
        <span className="ms" style={{ fontSize: 16, color: 'var(--md-on-surface-variant)' }}>zoom_in</span>
      </div>

      {/* Aspect ratio buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {ASPECT_OPTIONS.map(({ key, label }) => {
          const active = selectedAspect === key
          return (
            <button
              key={key}
              type="button"
              disabled={isBusy}
              onClick={() => setSelectedAspect(key)}
              style={{
                padding: '5px 14px', borderRadius: 999,
                background: active ? 'var(--md-primary)' : 'var(--md-surface-container)',
                color: active ? 'var(--md-on-primary)' : 'var(--md-on-surface-variant)',
                border: active ? 'none' : '1px solid var(--md-outline-variant)',
                fontSize: 12, fontWeight: 500, cursor: isBusy ? 'default' : 'pointer',
                fontFamily: 'inherit', transition: 'all 100ms',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isBusy}
          style={{
            padding: '8px 18px', borderRadius: 999,
            background: 'transparent',
            border: '1px solid var(--md-outline-variant)',
            color: 'var(--md-on-surface-variant)', fontSize: 13,
            cursor: isBusy ? 'default' : 'pointer', fontFamily: 'inherit',
          }}
        >
          ביטול
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isBusy || !croppedAreaPixels}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 20px', borderRadius: 999,
            background: isBusy ? 'var(--md-surface-container)' : 'var(--md-primary)',
            color: isBusy ? 'var(--md-on-surface-variant)' : 'var(--md-on-primary)',
            border: 'none',
            fontSize: 13, fontWeight: 500,
            cursor: isBusy || !croppedAreaPixels ? 'default' : 'pointer',
            fontFamily: 'inherit', transition: 'all 100ms',
          }}
        >
          <span className="ms" style={{ fontSize: 16 }}>
            {isBusy ? 'hourglass_empty' : 'check'}
          </span>
          {isBusy ? 'מעלה תמונה…' : 'אישור'}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 8,
      background: 'var(--md-error-container)', color: 'var(--md-on-error-container)',
      fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span className="ms" style={{ fontSize: 16, flexShrink: 0 }}>error</span>
      {message}
    </div>
  )
}
