import { Vector3, MathUtils } from 'three'

/** Rome, as a representative anchor point for "Italy" on the globe. */
export const ITALY = { lat: 41.9, lon: 12.5 }

/**
 * Converts lat/lon (degrees) to a unit-sphere direction using the convention
 * x = cos(lat)·sin(lon), y = sin(lat), z = cos(lat)·cos(lon) — chosen so that
 * lon = 0 sits on the +Z axis, i.e. facing the default camera.
 */
export function latLonToVector3(lat: number, lon: number, radius = 1): Vector3 {
  const latRad = MathUtils.degToRad(lat)
  const lonRad = MathUtils.degToRad(lon)
  const x = Math.cos(latRad) * Math.sin(lonRad)
  const y = Math.sin(latRad)
  const z = Math.cos(latRad) * Math.cos(lonRad)
  return new Vector3(x, y, z).multiplyScalar(radius)
}

/** The group-space Y rotation that brings the given longitude to face +Z (the camera). */
export function rotationToFaceLongitude(lonDeg: number): number {
  return -MathUtils.degToRad(lonDeg)
}

function pseudoNoise(lat: number, lon: number): number {
  return Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453 % 1
}

/** Deterministic, hand-tuned continent approximation for a stylized dot-globe.
 * Not cartographically precise — this is an abstract "Stripe/Vercel-style" globe,
 * not a photo-real Earth, which fits the restrained premium aesthetic. */
export function isLand(lat: number, lon: number): boolean {
  const blobs: [number, number, number, number][] = [
    [48, -100, 24, 34], // North America
    [64, -105, 16, 42], // Canada / Alaska
    [72, -42, 9, 11], // Greenland
    [-16, -60, 30, 17], // South America
    [50, 15, 15, 24], // Europe (incl. Italy)
    [54, -3, 5, 5], // British Isles
    [4, 20, 34, 24], // Africa
    [44, 90, 30, 54], // Asia main
    [20, 76, 15, 19], // Indian subcontinent
    [10, 108, 12, 14], // SE Asia
    [36, 138, 6, 4], // Japan
    [-25, 134, 12, 17], // Australia
  ]

  const jitter = pseudoNoise(lat, lon) * 0.16

  for (const [latC, lonC, latR, lonR] of blobs) {
    const dl = (lat - latC) / latR
    const dn = (lon - lonC) / lonR
    if (dl * dl + dn * dn <= 1 + jitter) return true
  }

  // Central American land bridge (thin, doesn't fit an ellipse well)
  if (lat > 7 && lat < 19 && lon > -102 && lon < -83) return true

  return false
}
