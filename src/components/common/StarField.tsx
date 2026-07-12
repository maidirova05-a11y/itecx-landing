import './StarField.css'

interface StarSpec {
  left: string
  top: string
  dur: string
  scale: number
  delay: string
}

/* Fixed, hand-scattered positions — deterministic so the layout never shifts
   between renders, biased to the section edges so stars don't fight the text. */
const STARS: StarSpec[] = [
  { left: '4%', top: '12%', dur: '3.2s', scale: 1, delay: '0s' },
  { left: '9%', top: '68%', dur: '2.4s', scale: 0.8, delay: '0.6s' },
  { left: '16%', top: '30%', dur: '4.1s', scale: 1.2, delay: '1.2s' },
  { left: '28%', top: '85%', dur: '3.6s', scale: 0.7, delay: '0.3s' },
  { left: '41%', top: '8%', dur: '2.8s', scale: 1, delay: '1.6s' },
  { left: '55%', top: '92%', dur: '3.9s', scale: 0.9, delay: '0.9s' },
  { left: '63%', top: '16%', dur: '2.2s', scale: 0.7, delay: '0.2s' },
  { left: '72%', top: '74%', dur: '4.4s', scale: 1.1, delay: '1.9s' },
  { left: '81%', top: '38%', dur: '3s', scale: 0.8, delay: '0.5s' },
  { left: '88%', top: '10%', dur: '2.6s', scale: 1.2, delay: '1.4s' },
  { left: '93%', top: '62%', dur: '3.4s', scale: 0.9, delay: '0.8s' },
  { left: '96%', top: '88%', dur: '2.9s', scale: 0.7, delay: '0.1s' },
]

function Star({ spec }: { spec: StarSpec }) {
  return (
    <div
      className="sf-star"
      style={
        {
          left: spec.left,
          top: spec.top,
          '--sf-dur': spec.dur,
          '--sf-scale': spec.scale,
          '--sf-delay': spec.delay,
        } as React.CSSProperties
      }
    >
      <div className="sf-row">
        <div className="sf-c br" />
        <div className="sf-c bl" />
      </div>
      <div className="sf-row">
        <div className="sf-c tr" />
        <div className="sf-c tl" />
      </div>
    </div>
  )
}

/** Subtle twinkling-stars backdrop for a section (put inside `relative overflow-hidden`). */
export function StarField() {
  return (
    <div className="sf-field" aria-hidden="true">
      {STARS.map((spec, i) => (
        <Star key={i} spec={spec} />
      ))}
    </div>
  )
}
