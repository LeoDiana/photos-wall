import { doc, getDoc, setDoc } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'

async function getBackground(wallId = 'photos') {
  const wallRef = doc(db, 'walls', wallId)
  const wallSnapshot = await getDoc(wallRef)

  if (wallSnapshot.data()) {
    return (wallSnapshot.data() as { background: string | null }).background || null
  } else {
    await setDoc(wallRef, { background: null })
    return null
  }
}

export default getBackground
