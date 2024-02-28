import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import Wall from 'components/Wall/Wall.tsx'
import useUpload from 'hooks/useUpload.ts'
import { ImageData } from 'types/imageData.ts'

import { addImage, getImages, updateImageData } from './api'
import deleteImage from './api/deleteImage.ts'
import UploadWrapper from './components/UploadWrapper'

function isImageWithoutCoords(imageData: ImageData) {
  return imageData.x === null && imageData.y === null
}

function App() {
  const { wallId } = useParams() as {
    wallId: string
  }
  const { handleChange, urls, clear } = useUpload()
  const [images, setImages] = useState<ImageData[]>([])

  const movingImageIndex = useRef<number | null>(null)

  const wallContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (wallContainerRef.current) {
      const centerWidth =
        (wallContainerRef.current.scrollWidth - wallContainerRef.current.offsetWidth) / 2
      const centerHeight =
        (wallContainerRef.current.scrollHeight - wallContainerRef.current.offsetHeight) / 2
      wallContainerRef.current.scrollLeft = centerWidth
      wallContainerRef.current.scrollTop = centerHeight
    }
  }, [])

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    handleChange(event)
  }

  useEffect(() => {
    ;(async () => {
      for (const url of urls) {
        if (url !== 'loading') {
          const photo = await addImage(url, wallId)
          setImages((images) => [...images, photo])
        }
      }
      if (urls.length > 0 && urls.every((url) => url !== 'loading')) {
        clear()
      }
    })()
  }, [urls, wallId])

  useEffect(() => {
    ;(async () => {
      setImages(await getImages(wallId))
    })()
  }, [wallId])

  function handleImagePositionChange(id: string, x: number | null, y: number | null) {
    updateImageData(id, wallId, { x, y })
    setImages((images) =>
      images.map((img) => (img.id === id ? { ...img, x, y, order: Date.now() } : img)),
    )
  }

  function bringToFront(id: string) {
    setImages((images) =>
      images.map((img) => (img.id === id ? { ...img, order: Date.now() } : img)),
    )
  }

  function handleMoveImageToWall(event: MouseEvent<HTMLDivElement>) {
    if (movingImageIndex.current !== null) {
      const wall = event.target.getBoundingClientRect()
      const selectedImageId = images[movingImageIndex.current].id
      const mouseX = event.clientX - wall.x
      const mouseY = event.clientY - wall.y

      const { x, y } = {
        x: mouseX,
        y: mouseY,
      }
      handleImagePositionChange(selectedImageId, x, y)
      movingImageIndex.current = null
    }
  }

  function handleRemoveFromWall(id: string) {
    handleImagePositionChange(id, null, null)
  }

  function handleDeleteImage(id: string) {
    deleteImage(id, wallId)
    setImages((images) => images.filter((img) => img.id !== id))
  }

  return (
    <div>
      <h1 className='text-3xl text-center mt-2'>My wall</h1>
      <div className='w-screen h-[500px] overflow-scroll' ref={wallContainerRef}>
        <Wall
          images={images}
          onImagePositionChange={handleImagePositionChange}
          bringToFront={bringToFront}
          onMouseUp={handleMoveImageToWall}
          handleRemoveFromWall={handleRemoveFromWall}
          handleDeleteImage={handleDeleteImage}
        />
      </div>
      <div className='w-screen h-40 bg-rose-400 flex fixed bottom-0'>
        {images.map(
          (image, index) =>
            isImageWithoutCoords(image) && (
              <div
                key={image.id}
                className='h-[100px] w-[100px]'
                draggable
                onDragEnd={() => {
                  movingImageIndex.current = index
                }}
              >
                <img src={image.src} draggable={false} />
              </div>
            ),
        )}
      </div>
      <UploadWrapper onChange={handleUpload} multiple>
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
