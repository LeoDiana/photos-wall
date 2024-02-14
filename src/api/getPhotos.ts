import { collection, getDocs, query } from 'firebase/firestore'

import { db } from '../firebaseInstances.ts'
import { Image } from '../types/image.ts'

async function getPhotos(wallId = 'photos') {
  const photosQuery = query(collection(db, wallId))
  const photosSnapshot = await getDocs(photosQuery)
  const photos = photosSnapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id,
  }))

  return (await Promise.all(photos)) as unknown as Image[]
}

export default getPhotos
