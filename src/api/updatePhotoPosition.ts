import { doc, updateDoc } from 'firebase/firestore'

import { db } from '../firebaseInstances.ts'

async function updatePhotoPosition(
  id: string,
  x: number | null,
  y: number | null,
  wallId = 'photos',
) {
  const docRef = doc(db, wallId, id)
  await updateDoc(docRef, { x, y, order: Date.now() })
}

export default updatePhotoPosition
