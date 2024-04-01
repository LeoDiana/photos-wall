import { DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_WIDTH } from 'consts'
import { DefinedPosition, Dimensions } from 'types/imageData.ts'
import { rotatePoint } from 'utils/math'

function calcCornersCoords(
  dimensions: Dimensions,
  position: DefinedPosition,
  angle = 0,
  rotationCenter: DefinedPosition = {
    x: DEFAULT_IMAGE_WIDTH / 2,
    y: DEFAULT_IMAGE_HEIGHT / 2,
  },
) {
  const A = { x: position.x, y: position.y }
  const B = {
    x: dimensions.width + position.x,
    y: position.y,
  }
  const C = {
    x: dimensions.width + position.x,
    y: dimensions.height + position.y,
  }
  const D = {
    x: position.x,
    y: dimensions.height + position.y,
  }

  return {
    A: rotatePoint(rotationCenter, A, angle),
    B: rotatePoint(rotationCenter, B, angle),
    C: rotatePoint(rotationCenter, C, angle),
    D: rotatePoint(rotationCenter, D, angle),
  }
}

export default calcCornersCoords
