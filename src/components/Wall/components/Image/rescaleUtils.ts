import { MAX_SCALE } from 'consts'
import { DefinedPosition, Dimensions, Side } from 'types/imageData.ts'
import { clamp, rotateVector, calculateScaleFactor } from 'utils/math'

export function calcRescaledDimensions(
  widthDif: number,
  heightDif: number,
  imageDimensions: Dimensions,
  originalDimensions: Dimensions,
): Dimensions & {
  scaleFactor: number
} {
  const suggestedWidth = imageDimensions.width + widthDif
  const suggestedHeight = imageDimensions.height + heightDif

  const scaleX: number = suggestedWidth / imageDimensions.width
  const scaleY: number = suggestedHeight / imageDimensions.height
  const scale: number = (scaleX + scaleY) / 2

  const scaledWidth = imageDimensions.width * scale
  const scaledHeight = imageDimensions.height * scale

  const scaleFactor = clamp(
    0,
    MAX_SCALE,
    calculateScaleFactor(
      originalDimensions.width,
      originalDimensions.height,
      scaledWidth,
      scaledHeight,
    ),
  )

  return {
    width: originalDimensions.width * scaleFactor,
    height: originalDimensions.height * scaleFactor,
    scaleFactor,
  }
}

export function getCornersDif(
  difX: number,
  difY: number,
  movingSides: Side[],
  scalingVector: DefinedPosition = { x: 1, y: 1 },
) {
  const nwCornerDif = { x: 0, y: 0 }
  const seCornerDif = { x: 0, y: 0 }

  if (movingSides.includes(Side.top)) {
    nwCornerDif.y = scalingVector.y * difY
  }
  if (movingSides.includes(Side.right)) {
    seCornerDif.x = scalingVector.x * difX
  }
  if (movingSides.includes(Side.bottom)) {
    seCornerDif.y = scalingVector.y * difY
  }
  if (movingSides.includes(Side.left)) {
    nwCornerDif.x = scalingVector.x * difX
  }

  return { width: nwCornerDif.x + seCornerDif.x, height: nwCornerDif.y + seCornerDif.y }
}

export function getScalingVector(movingSides: Side[], angle: number) {
  const vector = { x: 0, y: 0 }
  if (movingSides.includes(Side.top)) {
    vector.y = 1
  }
  if (movingSides.includes(Side.right)) {
    vector.x = 1
  }
  if (movingSides.includes(Side.bottom)) {
    vector.y = -1
  }
  if (movingSides.includes(Side.left)) {
    vector.x = -1
  }

  const rotatedVector = rotateVector(vector, angle)
  return { x: rotatedVector.x >= 0 ? 1 : -1, y: rotatedVector.y >= 0 ? 1 : -1 }
}
