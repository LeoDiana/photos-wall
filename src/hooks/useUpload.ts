import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { ChangeEvent, useState } from 'react'
import { v4 as uuid } from 'uuid'

import { storage } from 'firebaseInstances'

const MAX_SIZE = 2 * 1024 ** 2
const MAX_FILES = 10

function useUpload() {
  const [filesUrls, setFilesUrls] = useState<string[]>([])

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const newUrls = Array.from({
      length: Math.min(MAX_FILES - filesUrls.length, event.target.files!.length),
    }).fill('loading') as string[]
    setFilesUrls((urls) => [...urls, ...newUrls])

    const filesArray = Array.from(event.target.files as FileList)
    for (const file of filesArray) {
      const index = filesArray.indexOf(file)
      if (index >= newUrls.length) {
        return
      }

      if (file.size > MAX_SIZE) {
        console.log('Big file!!') // TODO handle big files
        setFilesUrls((urls) => urls.filter((_, i) => index !== i))
        continue
      }

      const storageRef = ref(storage, `user-photos/${uuid()}`)

      const snapshot = await uploadBytes(storageRef, file)
      const newUrl = await getDownloadURL(snapshot.ref)
      setFilesUrls((urls) => urls.map((url, i) => (i === index ? newUrl : url)))
    }
  }

  function handleRemove(url: string) {
    return () => {
      setFilesUrls((urls) => urls.filter((u) => u !== url))
    }
  }

  function clear() {
    setFilesUrls([])
  }

  return {
    urls: filesUrls,
    handleChange,
    handleRemove,
    clear,
  }
}

export default useUpload
