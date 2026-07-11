import './CssEarth.css'
import { useContent } from '../../i18n'

/** A single 4-point sparkle star (two rows of curved-corner quarters). */
function Star({ left, top, duration }: { left: string; top: string; duration: string }) {
  return (
    <div className="css-star" style={{ left, top, animationDuration: duration }}>
      <div className="css-star-row">
        <div className="css-star-corner br" />
        <div className="css-star-corner bl" />
      </div>
      <div className="css-star-row">
        <div className="css-star-corner tr" />
        <div className="css-star-corner tl" />
      </div>
    </div>
  )
}

/**
 * Rotating photographic Earth (CSS-only, adapted from Uiverse.io by Lakshay-art).
 * Fills its parent slot; the sphere itself stays at its authored 250px and is
 * scaled via transform so the calibrated inset shadows keep their look.
 */
export function CssEarth() {
  const { ui } = useContent()

  return (
    <div className="css-earth-wrap" aria-hidden="true">
      <Star left="12%" top="18%" duration="3s" />
      <Star left="6%" top="55%" duration="2s" />
      <Star left="20%" top="82%" duration="4s" />
      <Star left="78%" top="12%" duration="2.5s" />
      <Star left="88%" top="48%" duration="3.5s" />
      <Star left="72%" top="86%" duration="1.8s" />
      <Star left="45%" top="6%" duration="4.5s" />
      <div className="css-earth">
        {/* Flag pinned to Italy, riding the same 30s scroll as the texture —
            marks where the international final ("мировой этап") takes place */}
        <div className="italy-marker">
          <span className="italy-dot" />
          <span className="italy-flag" />
          <span className="italy-label">{ui.earthFlag}</span>
        </div>
      </div>
    </div>
  )
}
