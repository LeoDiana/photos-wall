import { doc, getDoc, setDoc } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'

async function getTitle(wallId = 'photos') {
  const wallRef = doc(db, 'walls', wallId)
  const wallSnapshot = await getDoc(wallRef)

  if (wallSnapshot.data()) {
    return (wallSnapshot.data() as { title: string | null }).title || ''
  } else {
    await setDoc(wallRef, { title: 'My wall' })
    return 'My wall'
  }
}

export default getTitle
