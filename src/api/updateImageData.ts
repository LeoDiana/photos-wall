import { doc, updateDoc } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'
import { ImageData } from 'types/imageData.ts'

type UpdateImageDataProps = Partial<
  Pick<
    ImageData,
    | 'x'
    | 'y'
    | 'scale'
    | 'xOffset'
    | 'yOffset'
    | 'imageRotation'
    | 'borderRotation'
    | 'borderHeight'
    | 'borderWidth'
    | 'borderOffsetX'
    | 'borderOffsetY'
    | 'frameStyle'
  >
>

async function updateImageData(id: string, wallId = 'photos', data: UpdateImageDataProps) {
  const docRef = doc(db, 'walls', wallId, 'photos', id)
  await updateDoc(docRef, { order: Date.now(), ...data })
}

export default updateImageData
