/**
 * FerreroBall - Standalone Ferrero Rocher 3D model
 * For use in Animation Console
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface FerreroBallProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

export function FerreroBall({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}: FerreroBallProps) {
  const meshRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/ferrero.glb')

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.position.set(...position)
    meshRef.current.rotation.set(...rotation)
    meshRef.current.scale.setScalar(scale)
  })

  return (
    <primitive
      ref={meshRef}
      object={scene.clone()}
      scale={1.5}
    />
  )
}

// Preload the model
useGLTF.preload('/models/ferrero.glb')
