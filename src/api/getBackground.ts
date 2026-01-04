import { getFromStorage, setToStorage, STORAGE_KEYS } from 'utils/storage.ts'

async function getBackground(wallId = 'photos') {
  const storageKey = STORAGE_KEYS.background(wallId)
  const background = getFromStorage<string | null>(storageKey, null)
  if (background === null) {
    setToStorage(storageKey, null)
    return null
  }
  return background
}

export default getBackground
