// Helper utility for sessionStorage operations
// Data persists until the page is reloaded

const STORAGE_KEYS = {
  images: (wallId: string) => `wall_${wallId}_images`,
  title: (wallId: string) => `wall_${wallId}_title`,
  background: (wallId: string) => `wall_${wallId}_background`,
}

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = sessionStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to sessionStorage:', error)
  }
}

export function removeFromStorage(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from sessionStorage:', error)
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export { STORAGE_KEYS }

