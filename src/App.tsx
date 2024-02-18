import { ChangeEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import Canvas from 'components/Canvas'
import UploadWrapper from 'components/UploadWrapper'
import useUpload from 'hooks/useUpload.ts'
import { Image } from 'types/image.ts'

import { addPhoto, getPhotos, updatePhotoPosition } from './api'

function App() {
  const { wallId } = useParams() as {
    wallId: string
  }
  const { handleChange, urls } = useUpload()
  const [images, setImages] = useState<Image[]>([])

  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    handleChange(event)
  }

  useEffect(() => {
    ;(async () => {
      if (urls.length && urls[0] !== 'loading') {
        const photo = await addPhoto(urls[0], wallId)
        setImages((images) => [...images, photo])
      }
    })()
  }, [urls, wallId])

  useEffect(() => {
    ;(async () => {
      setImages(await getPhotos(wallId))
    })()
  }, [wallId])

  function handleImagePositionChange(id: string, x: number | null, y: number | null) {
    updatePhotoPosition(id, x, y, wallId)
    setImages((images) => images.map((img) => (img.id === id ? { ...img, x, y } : img)))
  }

  return (
    <div>
      <h1 className='text-3xl text-center mt-2'>My wall</h1>
      <Canvas
        images={images}
        onImagePositionChange={handleImagePositionChange}
        selectedImageId={selectedImageId}
        setSelectedImageId={setSelectedImageId}
      />
      <UploadWrapper onChange={handleUpload}>
        <div className='rounded-lg px-4 py-2 border-2 border-gray-300 font-medium fixed bottom-2 -translate-x-1/2 left-1/2'>
          Upload
        </div>
      </UploadWrapper>
      {urls.some((url) => url === 'loading') && (
        <div className='font-medium fixed bottom-1 -translate-x-1/2 left-1/2'>LOADING...</div>
      )}
    </div>
  )
}

export default App
