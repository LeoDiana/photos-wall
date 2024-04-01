import { DefinedPosition } from '../../types/imageData.ts'

function distanceBetweenPoints(p1: DefinedPosition, p2: DefinedPosition): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

export default distanceBetweenPoints
