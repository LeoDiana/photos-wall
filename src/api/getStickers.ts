import { collection, getDocs, query } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'

import { StickerFromGallery } from '../types/imageData.ts'

async function getStickers() {
  const stickersSnapshot = await getDocs(query(collection(db, 'stickers')))
  const stickers = stickersSnapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id,
  }))

  return (await Promise.all(stickers)) as unknown as StickerFromGallery[]
}

export default getStickers
