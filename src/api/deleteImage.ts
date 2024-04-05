import { doc, deleteDoc } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'

async function deleteImage(imageId: string, wallId = 'photos') {
  const docRef = doc(db, 'walls', wallId, 'photos', imageId)
  await deleteDoc(docRef)
}

export default deleteImage
