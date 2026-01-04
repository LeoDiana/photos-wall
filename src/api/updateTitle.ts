import { setToStorage, STORAGE_KEYS } from 'utils/storage.ts'

async function updateTitle(wallId = 'photos', value: string) {
  const storageKey = STORAGE_KEYS.title(wallId)
  setToStorage(storageKey, value)
}

export default updateTitle
