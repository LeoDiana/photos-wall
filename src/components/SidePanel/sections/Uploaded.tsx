import { ChangeEvent, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { addImage } from '../../../api'
import useUpload from '../../../hooks/useUpload.ts'
import useStore from '../../../store/useStore.ts'
import { ImageData } from '../../../types/imageData.ts'
import UploadWrapper from '../../UploadWrapper'

function isImageWithoutCoords(imageData: ImageData) {
  return imageData.x === null && imageData.y === null
}

function Uploaded() {
  const { wallId } = useParams() as {
    wallId: string
  }
  const { handleChange, urls, clear } = useUpload()

  const images = useStore((state) => state.images)
  const setImages = useStore((state) => state.setImages)
  const setMovingImageIndex = useStore((state) => state.setSelectedImageIndex)

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    handleChange(event)
  }

  useEffect(() => {
    ;(async () => {
      for (const url of urls) {
        if (url !== 'loading') {
          const photo = await addImage(url, wallId)
          setImages([...images, photo])
        }
      }
      if (urls.length > 0 && urls.every((url) => url !== 'loading')) {
        clear()
      }
    })()
  }, [urls, wallId])

  return (
    <>
      <UploadWrapper onChange={handleUpload} multiple>
        <div className='rounded-lg px-4 py-2 border-2 border-indigo-800 font-medium w-full bg-indigo-500 flex justify-center'>
          Upload
        </div>
      </UploadWrapper>
      {urls.some((url) => url === 'loading') && (
        <div className='font-medium fixed bottom-1 -translate-x-1/2 left-1/2'>LOADING...</div>
      )}
      <div className='flex gap-2 flex-wrap mt-4'>
        {images.map(
          (image, index) =>
            isImageWithoutCoords(image) && (
              <div
                key={image.id}
                className='h-[100px] w-[100px] bg-cover'
                style={{
                  backgroundImage: `url(${image.src})`,
                }}
                draggable
                onDragEnd={() => setMovingImageIndex(index)}
              />
            ),
        )}
      </div>
    </>
  )
}

export default Uploaded
