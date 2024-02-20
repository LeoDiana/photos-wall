import { MouseEvent, useEffect, useRef } from 'react'

import { ImageData } from 'types/imageData.ts'
import getSimplifiedImageOrders from 'utils/getSimplifiedImageOrders.ts'
import isImageWithCoords from 'utils/isImageWithCoords.ts'

import Image from './Image.tsx'

interface Position {
  x: number | null
  y: number | null
}

interface WallProps {
  images: ImageData[]
  onImagePositionChange: (id: string, x: number | null, y: number | null) => void
  bringToFront: (id: string) => void
  onMouseUp: (e: MouseEvent<HTMLDivElement>) => void
  handleRemoveFromWall: (id: string) => void
}

function Wall({
  images,
  onImagePositionChange,
  bringToFront,
  onMouseUp,
  handleRemoveFromWall,
}: WallProps) {
  const imageRefs = useRef<HTMLDivElement[]>([])
  const positions = useRef<Position[]>([])
  const offset = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const selectedImageIndex = useRef<number | null>(null)

  useEffect(() => {
    positions.current = images.map((image) => ({ x: image.x, y: image.y }))
    imageRefs.current.forEach((imageRef, index) => {
      if (imageRef?.style) {
        imageRef.style.left = positions.current[index].x + 'px'
        imageRef.style.top = positions.current[index].y + 'px'
      }
    })
  }, [images])

  function handleSelectImage(index: number) {
    selectedImageIndex.current = index
    bringToFront(images[index].id)
  }

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    isDragging.current = true
    if (selectedImageIndex.current !== null) {
      offset.current = {
        x: event.clientX - (positions.current[selectedImageIndex.current].x || 0),
        y: event.clientY - (positions.current[selectedImageIndex.current].y || 0),
      }
    }
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (isDragging.current && selectedImageIndex.current !== null) {
      imageRefs.current[selectedImageIndex.current].style.left =
        event.clientX - offset.current.x + 'px'
      imageRefs.current[selectedImageIndex.current].style.top =
        event.clientY - offset.current.y + 'px'
      positions.current[selectedImageIndex.current] = {
        x: event.clientX - offset.current.x,
        y: event.clientY - offset.current.y,
      }
    }
  }

  function handleMouseUp(event: MouseEvent<HTMLDivElement>) {
    if (selectedImageIndex.current !== null) {
      const selectedImageId = images[selectedImageIndex.current].id
      const mouseX = event.clientX - offset.current.x
      const mouseY = event.clientY - offset.current.y

      const { x, y } = positions.current[selectedImageIndex.current] || {
        x: mouseX,
        y: mouseY,
      }
      onImagePositionChange(selectedImageId, x, y)
    }
    isDragging.current = false
    selectedImageIndex.current = null
  }

  const imageOrders = getSimplifiedImageOrders(images)

  return (
    <div
      className='bg-teal-100 w-full h-full relative overflow-hidden'
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOver={onMouseUp}
    >
      {images.map(
        (img, index) =>
          isImageWithCoords(img) && (
            <Image
              key={index}
              ref={(element) => (imageRefs.current[index] = element as HTMLDivElement)}
              src={img.src}
              order={imageOrders[index]}
              onSelect={() => handleSelectImage(index)}
              onRemoveFromWall={() => handleRemoveFromWall(img.id)}
            />
          ),
      )}
    </div>
  )
}

export default Wall
