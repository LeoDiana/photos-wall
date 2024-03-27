import { DefinedPosition, Dimensions } from 'types/imageData.ts'

import rotatePoint from './rotatePoint.ts'

function calcCornersCoords(dimensions: Dimensions, position: DefinedPosition, angle = 0) {
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

  const center = {
    x: 125,
    y: 125,
  }

  return {
    A: rotatePoint(center, A, angle),
    B: rotatePoint(center, B, angle),
    C: rotatePoint(center, C, angle),
    D: rotatePoint(center, D, angle),
  }
}

export default calcCornersCoords
