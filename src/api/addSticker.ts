import { ImageType, StickerData, StickerFromGallery } from 'types/imageData.ts'
import { generateId, getFromStorage, setToStorage, STORAGE_KEYS } from 'utils/storage.ts'

async function addSticker(wallId: string, stickerData: StickerFromGallery) {
  const newSticker: StickerData = {
    id: generateId(),
    src: stickerData.src,
    order: Date.now(),
    x: null,
    y: null,
    originalHeight: stickerData.height,
    originalWidth: stickerData.width,
    imageRotation: 0,
    scale: stickerData.scale,
    type: ImageType.sticker,
  }

  // Save to sessionStorage
  const storageKey = STORAGE_KEYS.images(wallId)
  const existingImages = getFromStorage<(StickerData | import('types/imageData.ts').ImageData)[]>(
    storageKey,
    [],
  )
  setToStorage(storageKey, [...existingImages, newSticker])

  return newSticker
}

export default addSticker
