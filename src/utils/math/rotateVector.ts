import { DefinedPosition } from '../../types/imageData.ts'

function rotateVector(vector: DefinedPosition, angleInRadians: number) {
  const rotatedX = vector.x * Math.cos(angleInRadians) - vector.y * Math.sin(angleInRadians)
  const rotatedY = vector.x * Math.sin(angleInRadians) + vector.y * Math.cos(angleInRadians)
  return { x: rotatedX, y: rotatedY }
}

export default rotateVector
