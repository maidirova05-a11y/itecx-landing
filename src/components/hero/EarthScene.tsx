import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { ITALY, isLand, latLonToVector3, rotationToFaceLongitude } from '../../lib/geo'
import { Spring } from '../../lib/spring'

const RADIUS = 1
/** Initial idle-facing longitude — a neutral Eurasian view before the reveal. */
const DEFAULT_LON = 68

function useLandPositions(count = 2600) {
  return useMemo(() => {
    const positions: THREE.Vector3[] = []
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = goldenAngle * i
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      const lat = THREE.MathUtils.radToDeg(Math.asin(y))
      const lon = THREE.MathUtils.radToDeg(Math.atan2(x, z))
      if (isLand(lat, lon)) positions.push(new THREE.Vector3(x, y, z))
    }
    return positions
  }, [count])
}

function LandDots() {
  const positions = useLandPositions()
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    positions.forEach((direction, i) => {
      dummy.position.copy(direction).multiplyScalar(RADIUS * 1.012)
      const scale = 0.8 + ((i * 37) % 10) / 10
      dummy.scale.setScalar(scale)
      dummy.lookAt(direction.clone().multiplyScalar(RADIUS * 2))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [positions])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]}>
      <sphereGeometry args={[0.0105, 6, 6]} />
      <meshBasicMaterial color="#d7e3f5" />
    </instancedMesh>
  )
}

function GlobeSurface() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[RADIUS * 0.994, 64, 64]} />
        <meshStandardMaterial
          color="#0d2b52"
          roughness={0.8}
          metalness={0.06}
          emissive="#03101f"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[RADIUS * 1.001, 3]} />
        <meshBasicMaterial color="#6f93c4" wireframe transparent opacity={0.05} />
      </mesh>
    </>
  )
}

function useCloudTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.35)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
}

/** Sparse, soft cloud wisps scattered independently of the land dots — sells the
 * "planet seen from orbit" read instead of a bare dot-globe. */
function Clouds() {
  const texture = useCloudTexture()
  const positions = useMemo(() => {
    const count = 80
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = goldenAngle * i * 2.6
      pts.push(new THREE.Vector3(Math.cos(theta) * radiusAtY, y, Math.sin(theta) * radiusAtY))
    }
    return pts
  }, [])

  return (
    <group>
      {positions.map((p, i) => {
        const scale = 0.16 + ((i * 53) % 10) / 22
        return (
          <sprite key={i} position={p.clone().multiplyScalar(RADIUS * 1.03)} scale={[scale, scale, scale]}>
            <spriteMaterial map={texture} transparent opacity={0.22} depthWrite={false} />
          </sprite>
        )
      })}
    </group>
  )
}

function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { glowColor: { value: new THREE.Color('#2f5b96') } },
        vertexShader: `
          varying float intensity;
          void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormel = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
            intensity = pow(0.68 - dot(vNormal, vNormel), 3.2);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          varying float intensity;
          void main() {
            gl_FragColor = vec4(glowColor, 1.0) * intensity;
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    []
  )

  return (
    <mesh material={material}>
      <sphereGeometry args={[RADIUS * 1.18, 64, 64]} />
    </mesh>
  )
}

function ItalyMarker({ arrived, reducedMotion }: { arrived: boolean; reducedMotion: boolean }) {
  const position = useMemo(() => latLonToVector3(ITALY.lat, ITALY.lon, RADIUS * 1.03), [])
  const dotRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  useFrame((state) => {
    if (!arrived) return

    if (reducedMotion) {
      if (ringRef.current) {
        ringRef.current.scale.setScalar(1.6)
        ;(ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.35
        ringRef.current.quaternion.copy(camera.quaternion)
      }
      return
    }

    const t = state.clock.elapsedTime
    if (dotRef.current) {
      dotRef.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.12)
    }
    if (ringRef.current) {
      const pulse = (t * 0.55) % 1
      ringRef.current.scale.setScalar(1 + pulse * 2.2)
      ;(ringRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.5 * (1 - pulse))
      ringRef.current.quaternion.copy(camera.quaternion)
    }
  })

  return (
    <group position={position}>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.028, 0.036, 32]} />
        <meshBasicMaterial color="#e31f2d" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

function GlobeGroup({ focusItaly, reducedMotion }: { focusItaly: boolean; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null)
  const yaw = useRef(new Spring(rotationToFaceLongitude(DEFAULT_LON), 0.045, 0.86))
  const tiltX = useRef(new Spring(0, 0.06, 0.82))
  const tiltZ = useRef(new Spring(0, 0.06, 0.82))
  const intro = useRef(new Spring(0, 0.026, 0.83))
  const drift = useRef(rotationToFaceLongitude(DEFAULT_LON))
  const { pointer } = useThree()

  useEffect(() => {
    if (reducedMotion) {
      intro.current.jumpTo(1)
    } else {
      intro.current.set(1)
    }
  }, [reducedMotion])

  useEffect(() => {
    if (!focusItaly) return
    const target = rotationToFaceLongitude(ITALY.lon)
    if (reducedMotion) {
      yaw.current.jumpTo(target)
    } else {
      yaw.current.setAngle(target)
    }
  }, [focusItaly, reducedMotion])

  useFrame(() => {
    if (!focusItaly && !reducedMotion) {
      drift.current += 0.00085
      yaw.current.set(drift.current)
    }

    const yawValue = yaw.current.step()
    const introValue = intro.current.step()

    if (!reducedMotion) {
      tiltX.current.set(pointer.y * 0.05)
      tiltZ.current.set(-pointer.x * 0.035)
    }
    const tiltXValue = tiltX.current.step()
    const tiltZValue = tiltZ.current.step()

    const node = group.current
    if (!node) return
    node.rotation.y = yawValue
    node.rotation.x = tiltXValue
    node.rotation.z = tiltZValue
    node.scale.setScalar(introValue)
    node.position.y = (1 - introValue) * -0.4
  })

  return (
    <group ref={group}>
      <GlobeSurface />
      <LandDots />
      <Clouds />
      <ItalyMarker arrived={focusItaly} reducedMotion={reducedMotion} />
      <Atmosphere />
    </group>
  )
}

export function EarthScene({ focusItaly, reducedMotion = false }: { focusItaly: boolean; reducedMotion?: boolean }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.1], fov: 36 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.7} />
      <pointLight position={[4, 3, 5]} intensity={1.9} color="#e8eefc" />
      <pointLight position={[-5, -2, -3]} intensity={0.5} color="#2f5b96" />
      {!reducedMotion && <Stars radius={60} depth={30} count={1200} factor={2} saturation={0} fade speed={0.35} />}
      <GlobeGroup focusItaly={focusItaly} reducedMotion={reducedMotion} />
    </Canvas>
  )
}
