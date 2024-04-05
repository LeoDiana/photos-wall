import { collection, getDocs, query } from 'firebase/firestore'

import { db } from 'firebaseInstances.ts'

async function getBackgrounds() {
  const backgroundsQuery = query(collection(db, 'backgrounds'))
  const backgroundsSnapshot = await getDocs(backgroundsQuery)
  const backgrounds = backgroundsSnapshot.docs.map((d) => d.data().src)

  return (await Promise.all(backgrounds)) as unknown as string[]
}

export default getBackgrounds
