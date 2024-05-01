import { doc, updateDoc } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'

async function updateTitle(wallId = 'photos', value: string) {
  const docRef = doc(db, 'walls', wallId)
  await updateDoc(docRef, { title: value })
}

export default updateTitle
