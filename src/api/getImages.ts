import { collection, getDocs, query } from 'firebase/firestore'

import { db } from '../firebaseInstances.ts'
import { ImageData } from '../types/imageData.ts'

async function getImages(wallId = 'photos') {
  const photosQuery = query(collection(db, wallId))
  const photosSnapshot = await getDocs(photosQuery)
  const photos = photosSnapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id,
  }))

  return (await Promise.all(photos)) as unknown as ImageData[]
}

export default getImages
