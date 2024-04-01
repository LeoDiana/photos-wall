import { DefinedPosition } from '../../types/imageData.ts'

function rotatePoint(center: DefinedPosition, point: DefinedPosition, angle: number) {
  return {
    x: (point.x - center.x) * Math.cos(angle) - (point.y - center.y) * Math.sin(angle) + center.x,
    y: (point.x - center.x) * Math.sin(angle) + (point.y - center.y) * Math.cos(angle) + center.y,
  }
}

export default rotatePoint
