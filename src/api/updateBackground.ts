import { doc, updateDoc } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'

async function updateBackground(wallId = 'photos', value: string) {
  const docRef = doc(db, 'walls', wallId)
  await updateDoc(docRef, { background: value })
}

export default updateBackground
