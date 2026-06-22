import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Box(){
  return (
    <mesh rotation={[30, 30, 0]} scale={1.2} position={[0,0,0]}>
      <boxGeometry args={[1,1,1]} />
      <meshStandardMaterial color="#60a5fa" metalness={0.3} roughness={0.6} />
    </mesh>
  )
}

export default function ThreeBackground(){
  return (
    <div className="w-full h-40 rounded-md overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5,5,5]} />
        <Box />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}
