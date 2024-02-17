import { addDoc, collection } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'

async function addPhoto(src: string, wallId = 'photos') {
  const docRef = collection(db, wallId)
  await addDoc(docRef, { src, width: 200, height: 200 })
}

export default addPhoto
