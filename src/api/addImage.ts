import { DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_WIDTH } from 'consts'
import { FrameStyle, ImageData, ImageType } from 'types/imageData.ts'
import calculateScaleFactor from 'utils/math/calculateScaleFactor.ts'
import { generateId, getFromStorage, setToStorage, STORAGE_KEYS } from 'utils/storage.ts'

async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise(function (resolve, reject) {
    const img = new Image()

    img.onload = function () {
      resolve({
        width: img.width,
        height: img.height,
      })
    }

    img.onerror = function () {
      reject(new Error('Failed to load image'))
    }

    img.src = src
  })
}

async function addImage(src: string, wallId: string) {
  const dimensions = await getImageDimensions(src)
  const newImage: ImageData = {
    id: generateId(),
    src,
    order: Date.now(),
    x: null,
    y: null,
    originalHeight: dimensions.height,
    originalWidth: dimensions.width,
    borderHeight: DEFAULT_IMAGE_HEIGHT,
    borderWidth: DEFAULT_IMAGE_WIDTH,
    borderOffsetX: 0,
    borderOffsetY: 0,
    xOffset: null,
    yOffset: null,
    imageRotation: 0,
    borderRotation: 0,
    frameStyle: FrameStyle.none,
    scale: calculateScaleFactor(dimensions.width, dimensions.height, 250, 250),
    type: ImageType.image,
  }

  // Save to sessionStorage
  const storageKey = STORAGE_KEYS.images(wallId)
  const existingImages = getFromStorage<ImageData[]>(storageKey, [])
  setToStorage(storageKey, [...existingImages, newImage])

  return newImage
}

export default addImage
