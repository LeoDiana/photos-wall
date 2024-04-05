import { doc, getDoc } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'

async function getBackground(wallId = 'photos') {
  const wallSnapshot = await getDoc(doc(db, 'walls', wallId))

  return (wallSnapshot.data() as { background: string | null }).background || null
}

export default getBackground
