import { getFromStorage, setToStorage, STORAGE_KEYS } from 'utils/storage.ts'

async function getTitle(wallId = 'photos') {
  const storageKey = STORAGE_KEYS.title(wallId)
  const title = getFromStorage<string | null>(storageKey, null)
  if (title === null) {
    const defaultTitle = 'My wall'
    setToStorage(storageKey, defaultTitle)
    return defaultTitle
  }
  return title || ''
}

export default getTitle
