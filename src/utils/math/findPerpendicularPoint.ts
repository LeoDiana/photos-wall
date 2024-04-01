import { DefinedPosition } from '../../types/imageData.ts'

function findPerpendicularPoint(
  line: {
    point1: DefinedPosition
    point2: DefinedPosition
  },
  point: DefinedPosition,
): DefinedPosition {
  if (line.point2.y - line.point1.y === 0) {
    return { x: point.x, y: line.point1.y }
  }

  if (line.point2.x - line.point1.x === 0) {
    return { x: line.point1.x, y: point.y }
  }

  const slope = (line.point2.y - line.point1.y) / (line.point2.x - line.point1.x)

  const perpendicularSlope = -1 / slope
  const perpendicularIntercept = point.y - perpendicularSlope * point.x

  const x =
    (perpendicularIntercept - line.point1.y + slope * line.point1.x) / (slope - perpendicularSlope)
  const y = slope * (x - line.point1.x) + line.point1.y

  return { x, y }
}

export default findPerpendicularPoint
