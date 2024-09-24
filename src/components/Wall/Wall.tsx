import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { updateImageData } from 'api'
import addSticker from 'api/addSticker.ts'
import deleteImage from 'api/deleteImage.ts'
import getBackground from 'api/getBackground.ts'
import { ZoomMinusIcon, ZoomPlusIcon } from 'assets'
import { MAX_ZOOM, MIN_ZOOM, ZOOM_FACTOR } from 'consts'
import useStore from 'store/useStore.ts'
import { ImageType, Position } from 'types/imageData.ts'
import getSimplifiedImageOrders from 'utils/getSimplifiedImageOrders.ts'
import isImageWithCoords from 'utils/isImageWithCoords.ts'
import clamp from 'utils/math/clamp.ts'
import setPosition from 'utils/setPosition.ts'

import Image from './components/Image/Image.tsx'
import Sticker from './components/Image/Sticker.tsx'
import { WallElement, ZoomBackdrop, ZoomContainer, ZoomIcon } from './styles.ts'

//TODO fix z-indexing

function Wall() {
  const { wallId } = useParams() as {
    wallId: string
  }

  const {
    images,
    setImages,
    updateImage,
    deleteImage: deleteImageFromStore,
    addImage: addImageToStore,
    movingSticker,
    setMovingSticker,
    movingImageIndex,
    setMovingImageIndex,
    setSelectedImageIndex,
    selectedBackground,
    setSelectedBackground,
  } = useStore((state) => state)

  const imageRefs = useRef<HTMLDivElement[]>([])
  const positions = useRef<Position[]>([])
  const offset = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const selectedImageIndex = useRef<number | null>(null)
  const [lastSelectedImageIndex, setLastSelectedImageIndex] = useState<number | null>(null)
  const [scale, setScale] = useState(1)
  const wallRef = useRef<HTMLDivElement>(null)

  function handleImagePositionChange(id: string, x: number | null, y: number | null) {
    updateImageData(id, wallId, { x, y })
    updateImage(id, { x, y, order: Date.now() })
  }

  function bringToFront(id: string) {
    setImages(images.map((img) => (img.id === id ? { ...img, order: Date.now() } : img)))
  }

  async function handleMoveImageToWall(event: MouseEvent<HTMLDivElement>) {
    const wall = (event.target as HTMLDivElement).getBoundingClientRect()
    const x = event.clientX - wall.x
    const y = event.clientY - wall.y

    if (movingImageIndex !== null) {
      handleImagePositionChange(images[movingImageIndex].id, x, y)
      setMovingImageIndex(null)
    }

    if (movingSticker !== null) {
      const photo = await addSticker(wallId, movingSticker)
      addImageToStore(photo)
      handleImagePositionChange(photo.id, x, y)
      setMovingSticker(null)
    }
  }

  function handleRemoveFromWall(id: string) {
    handleImagePositionChange(id, null, null)
  }

  function handleDelete(id: string) {
    deleteImage(id, wallId)
    deleteImageFromStore(id)
    setSelectedImageIndex(null)
  }

  useEffect(() => {
    positions.current = images.map((image) => ({ x: image.x, y: image.y }))
    imageRefs.current.forEach((imageRef, index) => {
      if (imageRef?.style) {
        setPosition(imageRef, positions.current[index].x, positions.current[index].y)
      }
    })
  }, [images])

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
      const newX = event.clientX / scale - offset.current.x
      const newY = event.clientY / scale - offset.current.y

      setPosition(imageRefs.current[selectedImageIndex.current], newX, newY)
      positions.current[selectedImageIndex.current] = {
        x: newX,
        y: newY,
      }
    }
  }

  function handleMouseMoveFinished(event: MouseEvent<HTMLDivElement>) {
    if (selectedImageIndex.current !== null) {
      const selectedImageId = images[selectedImageIndex.current].id
      const mouseX = event.clientX / scale - offset.current.x
      const mouseY = event.clientY / scale - offset.current.y

      const { x, y } = positions.current[selectedImageIndex.current] || {
        x: mouseX,
        y: mouseY,
      }
      handleImagePositionChange(selectedImageId, x, y)
    }
    isDragging.current = false
  }

  function handleMouseUp(event: MouseEvent<HTMLDivElement>) {
    handleMouseMoveFinished(event)
    setLastSelectedImageIndex(selectedImageIndex.current)
    selectedImageIndex.current = null
  }

  function handleMouseLeave(event: MouseEvent<HTMLDivElement>) {
    handleMouseMoveFinished(event)
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

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Backspace' && lastSelectedImageIndex) {
      if (images[lastSelectedImageIndex].type === ImageType.sticker) {
        handleDelete(images[lastSelectedImageIndex].id)
      }
      if (images[lastSelectedImageIndex].type === ImageType.image) {
        handleRemoveFromWall(images[lastSelectedImageIndex].id)
      }
    }
  }

  return (
    <>
      <ZoomContainer>
        <ZoomBackdrop />
        <ZoomIcon onClick={zoomIn} title='zoom in'>
          <ZoomPlusIcon />
        </ZoomIcon>
        <ZoomIcon onClick={zoomOut} title='zoom out'>
          <ZoomMinusIcon />
        </ZoomIcon>
      </ZoomContainer>
      <WallElement
        $bg={selectedBackground}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOver={handleMoveImageToWall}
        onMouseLeave={handleMouseLeave}
        ref={wallRef}
        onDragOver={(event) => {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'move'
        }}
        onDragEnter={(event) => {
          event.preventDefault()
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {images.map((img, index) =>
          img.type === ImageType.image && isImageWithCoords(img) ? (
            <Image
              key={index}
              ref={(element) => (imageRefs.current[index] = element as HTMLDivElement)}
              {...img}
              order={imageOrders[index]}
              onSelect={() => handleSelectImage(index)}
              isSelected={lastSelectedImageIndex === index}
            />
          ) : img.type === ImageType.sticker ? (
            <Sticker
              key={index}
              ref={(element) => (imageRefs.current[index] = element as HTMLDivElement)}
              {...img}
              order={imageOrders[index]}
              onSelect={() => handleSelectImage(index)}
              isSelected={lastSelectedImageIndex === index}
            />
          ) : null,
        )}
      </WallElement>
    </>
  )
}

export default Wall
