import { MouseEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import getBackground from 'api/getBackground.ts'
import { MAX_ZOOM, MIN_ZOOM, WALL_HEIGHT, WALL_WIDTH, ZOOM_FACTOR } from 'consts'
import useStore from 'store/useStore.ts'
import { ImageData, Position } from 'types/imageData.ts'
import getSimplifiedImageOrders from 'utils/getSimplifiedImageOrders.ts'
import isImageWithCoords from 'utils/isImageWithCoords.ts'
import clamp from 'utils/math/clamp.ts'

import Image from './Image.tsx'

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
  const { wallId } = useParams() as {
    wallId: string
  }
  const imageRefs = useRef<HTMLDivElement[]>([])
  const positions = useRef<Position[]>([])
  const offset = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const selectedImageIndex = useRef<number | null>(null)
  const [lastSelectedImageIndex, setLastSelectedImageIndex] = useState<number | null>(null)
  const [scale, setScale] = useState(1)
  const wallRef = useRef<HTMLDivElement>(null)
  const setSelectedImageIndex = useStore((state) => state.setSelectedImageIndex)
  const selectedBackground = useStore((state) => state.selectedBackground)
  const setSelectedBackground = useStore((state) => state.setSelectedBackground)

  useEffect(() => {
    positions.current = images.map((image) => ({ x: image.x, y: image.y }))
    imageRefs.current.forEach((imageRef, index) => {
      if (imageRef?.style) {
        imageRef.style.left = positions.current[index].x + 'px'
        imageRef.style.top = positions.current[index].y + 'px'
      }
    })
  }, [images])

  useEffect(() => {
    positions.current = positions.current.map((pos) => ({ x: pos.x, y: pos.y }))
    imageRefs.current.forEach((imageRef, index) => {
      if (imageRef?.style) {
        imageRef.style.left = positions.current[index].x + 'px'
        imageRef.style.top = positions.current[index].y + 'px'
      }
    })
  }, [scale])

  useEffect(() => {
    setSelectedImageIndex(lastSelectedImageIndex)
  }, [lastSelectedImageIndex])

  useEffect(() => {
    ;(async () => {
      setSelectedBackground(await getBackground(wallId))
    })()
  }, [wallId])

  function handleSelectImage(index: number) {
    selectedImageIndex.current = index
    bringToFront(images[index].id)
  }

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    setLastSelectedImageIndex(null)
    isDragging.current = true
    if (selectedImageIndex.current !== null) {
      offset.current = {
        x: event.clientX / scale - (positions.current[selectedImageIndex.current].x || 0),
        y: event.clientY / scale - (positions.current[selectedImageIndex.current].y || 0),
      }
    }
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (isDragging.current && selectedImageIndex.current !== null) {
      imageRefs.current[selectedImageIndex.current].style.left =
        event.clientX / scale - offset.current.x + 'px'
      imageRefs.current[selectedImageIndex.current].style.top =
        event.clientY / scale - offset.current.y + 'px'
      positions.current[selectedImageIndex.current] = {
        x: event.clientX / scale - offset.current.x,
        y: event.clientY / scale - offset.current.y,
      }
    }
  }

  function handleMouseUp(event: MouseEvent<HTMLDivElement>) {
    if (selectedImageIndex.current !== null) {
      const selectedImageId = images[selectedImageIndex.current].id
      const mouseX = event.clientX / scale - offset.current.x
      const mouseY = event.clientY / scale - offset.current.y

      const { x, y } = positions.current[selectedImageIndex.current] || {
        x: mouseX,
        y: mouseY,
      }
      onImagePositionChange(selectedImageId, x, y)
    }
    isDragging.current = false
    setLastSelectedImageIndex(selectedImageIndex.current)
    selectedImageIndex.current = null
  }

  function handleMouseLeave(event: MouseEvent<HTMLDivElement>) {
    if (selectedImageIndex.current !== null) {
      const selectedImageId = images[selectedImageIndex.current].id
      const mouseX = event.clientX / scale - offset.current.x
      const mouseY = event.clientY / scale - offset.current.y

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

  useEffect(() => {
    if (wallRef.current) {
      wallRef.current.style.transform = `scale(${scale})`
    }
  }, [scale])

  function zoomIn() {
    setScale((scale) => clamp(MIN_ZOOM, MAX_ZOOM, scale + ZOOM_FACTOR))
  }

  function zoomOut() {
    setScale((scale) => clamp(MIN_ZOOM, MAX_ZOOM, scale - ZOOM_FACTOR))
  }

  return (
    <>
      <div className='fixed right-2 top-1/2 text-3xl text-pink-600 z-[99999]'>
        <div onClick={zoomIn}>+</div>
        <div onClick={zoomOut}>-</div>
      </div>
      <div
        className={`bg-teal-50 absolute overflow-hidden origin-top-left bg-cover`}
        style={{
          width: WALL_WIDTH + 'px',
          height: WALL_HEIGHT + 'px',
          backgroundImage: `url(${selectedBackground})`,
          backgroundColor: selectedBackground || 'white',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOver={onMouseUp}
        onMouseLeave={handleMouseLeave}
        ref={wallRef}
        onDragOver={(event) => {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'move'
        }}
        onDragEnter={(event) => {
          event.preventDefault()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Backspace' && lastSelectedImageIndex) {
            handleRemoveFromWall(images[lastSelectedImageIndex].id)
          }
        }}
        tabIndex={0}
      >
        {images.map(
          (img, index) =>
            isImageWithCoords(img) && (
              <Image
                key={index}
                ref={(element) => (imageRefs.current[index] = element as HTMLDivElement)}
                {...img}
                order={imageOrders[index]}
                onSelect={() => handleSelectImage(index)}
                isSelected={lastSelectedImageIndex === index}
              />
            ),
        )}
      </div>
    </>
  )
}

export default Wall
