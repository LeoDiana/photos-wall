import { ImageData } from 'types/imageData.ts'
import { getFromStorage, setToStorage, STORAGE_KEYS } from 'utils/storage.ts'

type UpdateImageDataProps = Partial<
  Pick<
    ImageData,
    | 'x'
    | 'y'
    | 'scale'
    | 'xOffset'
    | 'yOffset'
    | 'imageRotation'
    | 'borderRotation'
    | 'borderHeight'
    | 'borderWidth'
    | 'borderOffsetX'
    | 'borderOffsetY'
    | 'frameStyle'
  >
>

async function updateImageData(id: string, wallId: string, data: UpdateImageDataProps) {
  const storageKey = STORAGE_KEYS.images(wallId)
  const images = getFromStorage<ImageData[]>(storageKey, [])
  const updatedImages = images.map((img) =>
    img.id === id ? { ...img, ...data, order: Date.now() } : img,
  )
  setToStorage(storageKey, updatedImages)
}

export default updateImageData
