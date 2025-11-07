import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'

function Model() {
  const { scene } = useGLTF('/assets/sparkie-icon.glb')
  return <primitive object={scene} scale={1.5} />
}

interface SparkieIcon3DProps {
  size?: 'small' | 'medium' | 'large'
}

export default function SparkieIcon3D({ size = 'large' }: SparkieIcon3DProps) {
  const sizeClasses = {
    small: 'h-30 w-30 md:h-30 md:w-30',
    medium: 'h-32 w-32 md:h-40 md:w-40',
    large: 'h-48 w-48 md:h-64 md:w-64',
  }

  return (
    <div className={sizeClasses[size]}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} />
          {/* Front lights */}
          <directionalLight position={[5, 5, 5]} intensity={8} />
          <directionalLight position={[-5, 5, 5]} intensity={8} />
          <pointLight position={[0, 5, 0]} intensity={4} />
          {/* Back lights */}
          <directionalLight position={[0, 5, -5]} intensity={6} />
          <directionalLight position={[5, 0, -5]} intensity={5} />
          <directionalLight position={[-5, 0, -5]} intensity={5} />
          {/* Bottom light */}
          <directionalLight position={[0, -5, 0]} intensity={5} />
          <Model />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

