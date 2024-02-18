import { addDoc, collection, getDoc } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'

import { Image } from '../types/image.ts'

async function addImage(src: string, wallId = 'photos') {
  const docRef = collection(db, wallId)
  const newImageRef = await addDoc(docRef, {
    src,
    order: Date.now(),
    x: null,
    y: null,
    width: 200,
    height: 200,
  })
  const newImageSnapshot = await getDoc(newImageRef)
  return { ...newImageSnapshot.data(), id: newImageSnapshot.id } as Image
}

export default addImage
