import { ChangeEvent, useState } from 'react'

import { MAX_FILES, MAX_SIZE } from '../consts'

function useUpload() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [filesUrls, setFilesUrls] = useState<string[]>([])

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setErrorMessage(null)
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
        setErrorMessage('File is more than 3mb')
        setFilesUrls((urls) => urls.filter((_, i) => index !== i))
        continue
      }

      // Create local object URL instead of uploading to Firebase
      const newUrl = URL.createObjectURL(file)
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
    errorMessage,
    clear,
  }
}

export default useUpload
