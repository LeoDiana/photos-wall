import { ImageData } from '../types/imageData.ts'

function isImageWithCoords(imageData: ImageData) {
  return imageData.x !== null && imageData.y !== null
}

export default isImageWithCoords
