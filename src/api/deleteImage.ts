import { getFromStorage, setToStorage, STORAGE_KEYS } from 'utils/storage.ts'

async function deleteImage(imageId: string, wallId = 'photos') {
  const storageKey = STORAGE_KEYS.images(wallId)
  const images = getFromStorage<Array<{ id: string }>>(storageKey, [])
  const filteredImages = images.filter((img) => img.id !== imageId)
  setToStorage(storageKey, filteredImages)
}

export default deleteImage
