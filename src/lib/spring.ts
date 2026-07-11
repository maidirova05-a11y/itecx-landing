/**
 * Minimal damped-harmonic-oscillator spring for driving numeric values
 * (e.g. a Three.js rotation) inside a useFrame/rAF loop.
 *
 * Tuned low-damping-ratio defaults give a gentle, physical settle without
 * visible overshoot bounce — "spring physics with small damping" per spec.
 */
export class Spring {
  value: number
  target: number
  velocity = 0
  private stiffness: number
  private damping: number

  constructor(initial: number, stiffness = 0.055, damping = 0.82) {
    this.value = initial
    this.target = initial
    this.stiffness = stiffness
    this.damping = damping
  }

  /** Assigns a new target, keeping the current velocity for a smooth redirect. */
  set(target: number) {
    this.target = target
  }

  /** Like set(), but chooses the closest angular target (mod 2π) so the object
   * always takes the shortest rotational path instead of spinning the long way. */
  setAngle(target: number) {
    const twoPi = Math.PI * 2
    let delta = (target - this.value) % twoPi
    if (delta > Math.PI) delta -= twoPi
    if (delta < -Math.PI) delta += twoPi
    this.target = this.value + delta
  }

  /** Immediately jumps to a value with no interpolation — used for prefers-reduced-motion. */
  jumpTo(value: number) {
    this.value = value
    this.target = value
    this.velocity = 0
  }

  step(): number {
    const force = (this.target - this.value) * this.stiffness
    this.velocity = (this.velocity + force) * this.damping
    this.value += this.velocity
    return this.value
  }

  get isSettled(): boolean {
    return Math.abs(this.velocity) < 0.00015 && Math.abs(this.target - this.value) < 0.0008
  }
}
