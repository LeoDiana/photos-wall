import { setToStorage, STORAGE_KEYS } from 'utils/storage.ts'

async function updateBackground(wallId = 'photos', value: string) {
  const storageKey = STORAGE_KEYS.background(wallId)
  setToStorage(storageKey, value)
}

export default updateBackground
