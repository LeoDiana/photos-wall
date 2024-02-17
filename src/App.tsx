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
    if (urls.length && urls[0] !== 'loading') {
      addPhoto(urls[0], wallId)
    }
  }, [urls, wallId])

  useEffect(() => {
    ;(async () => {
      setImages(await getPhotos(wallId))
    })()
  }, [wallId])

  return (
    <div>
      <h1 className='text-3xl text-center mt-2'>My wall</h1>
      <Canvas
        images={images}
        // key={JSON.stringify(imagesOnWall)}
        onImagePositionChange={(id: string, x: number | null, y: number | null) => {
          updatePhotoPosition(id, x, y, wallId)
        }}
        selectedImageId={selectedImageId}
        setSelectedImageId={setSelectedImageId}
      />
      <UploadWrapper onChange={handleUpload}>
        <div className='rounded-lg px-4 py-2 border-2 border-gray-300 font-medium fixed bottom-2 -translate-x-1/2 left-1/2'>
          Upload
        </div>
      </UploadWrapper>
    </div>
  )
}

export default App
