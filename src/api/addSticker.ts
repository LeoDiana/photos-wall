import { addDoc, collection, getDoc } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'
import { ImageType, StickerData, StickerFromGallery } from 'types/imageData.ts'

async function addSticker(wallId: string, stickerData: StickerFromGallery) {
  const docRef = collection(db, 'walls', wallId, 'photos')
  const newImageRef = await addDoc(docRef, {
    src: stickerData.src,
    order: Date.now(),
    x: null,
    y: null,
    originalHeight: stickerData.height,
    originalWidth: stickerData.width,
    imageRotation: 0,
    scale: stickerData.scale,
    type: ImageType.sticker,
  } satisfies Omit<StickerData, 'id'>)
  const newStickerSnapshot = await getDoc(newImageRef)
  return { ...newStickerSnapshot.data(), id: newStickerSnapshot.id } as StickerData
}

export default addSticker
