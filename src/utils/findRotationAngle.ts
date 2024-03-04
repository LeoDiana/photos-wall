import { DefinedPosition } from 'types/imageData.ts'

export function findRotationAngle(
  center: DefinedPosition,
  start: DefinedPosition,
  end: DefinedPosition,
) {
  const vectorStart = { x: start.x - center.x, y: start.y - center.y }
  const vectorEnd = { x: end.x - center.x, y: end.y - center.y }

  const angleStart = Math.atan2(vectorStart.y, vectorStart.x)
  const angleEnd = Math.atan2(vectorEnd.y, vectorEnd.x)

  let angleDiff = angleEnd - angleStart

  if (angleDiff < 0) {
    angleDiff += 2 * Math.PI
  }

  if (angleDiff >= 2 * Math.PI) {
    angleDiff -= 2 * Math.PI
  }

  return angleDiff
}
