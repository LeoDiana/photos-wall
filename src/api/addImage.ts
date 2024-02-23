import { addDoc, collection, getDoc } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'
import { ImageData } from 'types/imageData.ts'
import calculateScaleFactor from 'utils/calculateScaleFactor.ts'

async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise(function (resolve, reject) {
    const img = new Image()

    img.onload = function () {
      resolve({
        width: img.width,
        height: img.height,
      })
    }

    img.onerror = function () {
      reject(new Error('Failed to load image'))
    }

    img.src = src
  })
}

async function addImage(src: string, wallId = 'photos') {
  const docRef = collection(db, wallId)
  const dimensions = await getImageDimensions(src)
  const newImageRef = await addDoc(docRef, {
    src,
    order: Date.now(),
    x: null,
    y: null,
    originalHeight: dimensions.height,
    originalWidth: dimensions.width,
    rotation: 0,
    scale: calculateScaleFactor(dimensions.width, dimensions.height, 250, 250),
  })
  const newImageSnapshot = await getDoc(newImageRef)
  return { ...newImageSnapshot.data(), id: newImageSnapshot.id } as ImageData
}

export default addImage
