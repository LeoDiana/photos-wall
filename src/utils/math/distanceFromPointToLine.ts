import { DefinedPosition } from '../../types/imageData.ts'

function distanceFromPointToLine(
  point1: DefinedPosition,
  point2: DefinedPosition,
  point: DefinedPosition,
): number {
  const x1 = point1.x
  const y1 = point1.y
  const x2 = point2.x
  const y2 = point2.y
  const x0 = point.x
  const y0 = point.y

  const numerator = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1)
  const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2))
  const distance = numerator / denominator

  // Determine on which side of the line the point lies
  const side = (x2 - x1) * (y0 - y1) - (x0 - x1) * (y2 - y1)
  if (side > 0) {
    return distance // Point is on one side of the line
  } else if (side < 0) {
    return -distance // Point is on the other side of the line
  } else {
    return 0 // Point is on the line
  }
}

export default distanceFromPointToLine
