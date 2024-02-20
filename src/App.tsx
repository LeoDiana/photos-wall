import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import UploadWrapper from 'components/UploadWrapper'
import Wall from 'components/Wall/Wall.tsx'
import useUpload from 'hooks/useUpload.ts'
import { ImageData } from 'types/imageData.ts'

import { addImage, getImages, updateImagePosition } from './api'

function isImageWithoutCoords(imageData: ImageData) {
  return imageData.x === null && imageData.y === null
}

function App() {
  const { wallId } = useParams() as {
    wallId: string
  }
  const { handleChange, urls } = useUpload()
  const [images, setImages] = useState<ImageData[]>([])

  const movingImageIndex = useRef<number | null>(null)

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    handleChange(event)
  }

  useEffect(() => {
    ;(async () => {
      if (urls.length && urls[0] !== 'loading') {
        const photo = await addImage(urls[0], wallId)
        setImages((images) => [...images, photo])
      }
    })()
  }, [urls, wallId])

  useEffect(() => {
    ;(async () => {
      setImages(await getImages(wallId))
    })()
  }, [wallId])

  function handleImagePositionChange(id: string, x: number | null, y: number | null) {
    updateImagePosition(id, x, y, wallId)
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

  return (
    <div>
      <h1 className='text-3xl text-center mt-2'>My wall</h1>
      <div className='w-screen h-[500px]'>
        <Wall
          images={images}
          onImagePositionChange={handleImagePositionChange}
          bringToFront={bringToFront}
          onMouseUp={handleMoveImageToWall}
          handleRemoveFromWall={handleRemoveFromWall}
        />
      </div>
      <div className='w-screen h-40 bg-rose-400 flex'>
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
      {/* <Canvas */}
      {/*   images={images} */}
      {/*   onImagePositionChange={handleImagePositionChange} */}
      {/*   selectedImageId={selectedImageId} */}
      {/*   setSelectedImageId={setSelectedImageId} */}
      {/* /> */}
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
