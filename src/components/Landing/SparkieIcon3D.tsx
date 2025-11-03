import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Float } from '@react-three/drei'
import { Suspense, useRef } from 'react'

function Model() {
  const { scene } = useGLTF('/assets/sparkie-icon.glb')
  const groupRef = useRef<any>()
  
  // Fix color space encoding
  scene.traverse((child: any) => {
    if (child.isMesh && child.material) {
      const mat = child.material
      if (mat.map) (mat.map as any).encoding = 3001 // THREE.sRGBEncoding
      if (mat.emissiveMap) (mat.emissiveMap as any).encoding = 3001 // THREE.sRGBEncoding
      mat.emissiveIntensity = 1.5
    }
  })
  
  // Animate: Gentle breathing effect (scale) + subtle tilt
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime()
      
      // Breathing animation: gentle scale pulsing
      const breathe = Math.sin(time * 0.8) * 0.05 + 1 // 0.95 to 1.05
      groupRef.current.scale.set(30 * breathe, 30 * breathe, 30 * breathe)
      
      // Subtle tilt animation: like Sparkie is excited
      groupRef.current.rotation.z = Math.sin(time * 0.6) * 0.08 // -0.08 to 0.08 radians
    }
  })
  
  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

export default function SparkieIcon3D() {
  return (
    <div className="h-72 w-72 md:h-96 md:w-96">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 50 }}
        onCreated={({ gl }) => {
          // Set output encoding to sRGB for gamma-correct colors
          (gl as any).outputEncoding = 3001 // THREE.sRGBEncoding
          gl.toneMapping = 4 // THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1
        }}
      >
        <Suspense fallback={null}>
          {/* Strong ambient light for overall brightness */}
          <ambientLight intensity={0.5} />
          
          {/* Hemisphere light for natural sky/ground lighting */}
          <hemisphereLight intensity={1.0} color="#ffffff" groundColor="#ffffff" />
          
          {/* Main directional lights from multiple angles - keeping the nice top light effect */}
          <directionalLight position={[5, 8, 5]} intensity={1.5} />
          <directionalLight position={[-5, 3, 5]} intensity={1.0} />
          <directionalLight position={[0, -5, 3]} intensity={1} />
          
          {/* Point lights for highlights */}
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={1.2} />
          
          <Float
            speed={2}
            rotationIntensity={0.5}
            floatIntensity={0.5}
          >
            <Model />
          </Float>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

