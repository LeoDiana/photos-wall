import { StickerFromGallery } from '../types/imageData.ts'

// Stickers are no longer stored in Firebase, return empty array
async function getStickers(): Promise<StickerFromGallery[]> {
  return []
}

export default getStickers
