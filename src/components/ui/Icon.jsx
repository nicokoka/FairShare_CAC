import './icon.css'

/*
 * The single source of icons for the whole app. Every icon is a colored PNG from
 * ONE Icons8 pack (the "Color" pack) — locked in icons8.json at the repo root so
 * future work stays on the same family instead of drifting into a mismatched
 * pile. Assets live in src/assets/icons/<name>.png and are bundled by Vite, so
 * the app ships them itself (no runtime dependency on the Icons8 CDN).
 *
 * Usage:
 *   <Icon name="rocket" size={40} />        decorative (aria-hidden by default)
 *   <Icon name="link" size={16} label="…" /> meaningful (gets an accessible name)
 */

// Eagerly import every icon PNG and key it by filename (e.g. "rocket").
const modules = import.meta.glob('../../assets/icons/*.png', {
  eager: true,
  import: 'default',
})

const registry = {}
for (const path in modules) {
  const name = path.split('/').pop().replace('.png', '')
  registry[name] = modules[path]
}

export default function Icon({ name, size = 24, label = '', className = '', style }) {
  const src = registry[name]
  if (!src) {
    // Fail loud in dev so a typo'd name is obvious, quiet in production.
    if (import.meta.env?.DEV) {
      console.warn(`<Icon> unknown name: "${name}"`)
    }
    return null
  }

  const decorative = label === ''
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={decorative ? '' : label}
      aria-hidden={decorative ? 'true' : undefined}
      draggable="false"
      className={`icon ${className}`.trim()}
      style={style}
    />
  )
}
