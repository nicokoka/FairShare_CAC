import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/*
 * Renders `value` as a scannable QR code. We ask the qrcode library for a PNG
 * data-URL and drop it into an <img> — no canvas ref juggling, no
 * dangerouslySetInnerHTML, and it prints. The whole thing is generated in the
 * browser from our own invite URL, so there's no network call and nothing a
 * flaky third-party image service could break during a demo.
 *
 * High contrast (near-black on white) is deliberate: phone scanners read it far
 * more reliably than a low-contrast brand-colored code.
 *
 * @param {{ value: string, size?: number }} props
 */
export default function QrCode({ value, size = 168 }) {
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    let active = true
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: '#241038', light: '#ffffff' },
    })
      .then((url) => {
        if (active) setDataUrl(url)
      })
      .catch(() => {
        // If generation ever fails, we simply render nothing — the join code and
        // copyable link next to it still let a teammate in.
      })
    return () => {
      active = false
    }
  }, [value, size])

  if (!dataUrl) return null

  return (
    <img
      className="qr-img"
      src={dataUrl}
      width={size}
      height={size}
      alt={`QR code that opens the invite link ${value}`}
    />
  )
}
