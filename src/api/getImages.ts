import { ImageData } from 'types/imageData.ts'
import { getFromStorage, STORAGE_KEYS } from 'utils/storage.ts'

async function getImages(wallId = 'photos') {
  const storageKey = STORAGE_KEYS.images(wallId)
  return getFromStorage<ImageData[]>(storageKey, [])
}

export default getImages
