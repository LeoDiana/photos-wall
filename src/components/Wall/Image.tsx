import { ForwardedRef, forwardRef, MouseEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { updateImageData } from 'api'
import { ImageData, Position } from 'types/imageData.ts'
import calculateScaleFactor from 'utils/calculateScaleFactor.ts'
import clamp from 'utils/clamp.ts'

import ResizeHelper from './ResizeHelper.tsx'

interface ImageProps extends ImageData {
  order: number
  imageHeight?: number
  imageWidth?: number
  isSelected: boolean
  onSelect: () => void
  onRemoveFromWall: () => void
  onDeleteImage: () => void
}

const IMAGE_HEIGHT = 250
const IMAGE_WIDTH = 250

function Image(
  {
    src,
    originalWidth,
    originalHeight,
    xOffset,
    yOffset,
    scale,
    rotation,
    id,
    onSelect,
    onRemoveFromWall,
    onDeleteImage,
    isSelected = false,
    order = 0,
    imageHeight = IMAGE_HEIGHT,
    imageWidth = IMAGE_WIDTH,
  }: ImageProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [isEditingMode, setIsEditingMode] = useState(false)
  // const [currentRotation, setCurrentRotation] = useState(rotation)

  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const position = useRef<Position>({ x: 0, y: 0 })
  const offset = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const currentScale = useRef(scale)
  const imageOffset = useRef({ x: 0, y: 0 })
  const currentRotation = useRef(rotation)

  const { wallId } = useParams() as {
    wallId: string
  }

  useEffect(() => {
    setIsEditingMode(false)
  }, [isSelected])

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.style.width = originalWidth * scale + 'px'
      imageRef.current.style.height = originalHeight * scale + 'px'
    }
  }, [originalHeight, scale, originalWidth])

  useEffect(() => {
    if (imageContainerRef.current) {
      imageContainerRef.current!.style.left = xOffset + 'px'
      imageContainerRef.current!.style.top = yOffset + 'px'
      imageContainerRef.current!.style.rotate = `${rotation * 90}deg`
    }
  }, [xOffset, yOffset, rotation])

  function adjustImagePosition(mouseX = 0, mouseY = 0) {
    const imgElementHeight = imageRef.current!.getBoundingClientRect().height
    const imgElementWidth = imageRef.current!.getBoundingClientRect().width
    const direction = currentRotation.current < 2 ? -1 : 1
    const maxXOffset = direction * (imgElementWidth - imageWidth)
    const maxYOffset = direction * (imgElementHeight - imageHeight)
    imageOffset.current = {
      x: clamp(Math.min(maxXOffset, 0), Math.max(maxXOffset, 0), mouseX - offset.current.x),
      y: clamp(Math.min(maxYOffset, 0), Math.max(maxYOffset, 0), mouseY - offset.current.y),
    }
    imageContainerRef.current!.style.left = imageOffset.current.x + 'px'
    imageContainerRef.current!.style.top = imageOffset.current.y + 'px'
  }

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (isEditingMode) {
      isDragging.current = true
      offset.current = {
        x: event.clientX - (position.current.x || 0),
        y: event.clientY - (position.current.y || 0),
      }
      event.stopPropagation()
    }
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (isDragging.current) {
      adjustImagePosition(event.clientX, event.clientY)
      position.current = {
        x: event.clientX - offset.current.x,
        y: event.clientY - offset.current.y,
      }
    }
  }

  function handleMouseUp() {
    isDragging.current = false
    updateImageData(id, wallId, { xOffset: imageOffset.current.x, yOffset: imageOffset.current.y })
  }

  function handleScaling(diff: number) {
    currentScale.current = clamp(
      calculateScaleFactor(originalWidth, originalHeight, imageWidth, imageHeight),
      1,
      (originalWidth * scale + diff) / originalWidth,
    )
    if (imageRef.current) {
      imageRef.current.style.width = originalWidth * currentScale.current + 'px'
      imageRef.current.style.height = originalHeight * currentScale.current + 'px'
    }
  }

  function handleScalingFinished() {
    updateImageData(id, wallId, { scale: currentScale.current })
  }

  function changeRotation(rotationDirection: number) {
    currentRotation.current = (4 + currentRotation.current + rotationDirection) % 4
    imageContainerRef.current!.style.rotate = `${currentRotation.current * 90}deg`
    adjustImagePosition()
    updateImageData(id, wallId, { rotation: currentRotation.current })
  }

  function handleRotateClockwise(event: MouseEvent<HTMLDivElement>) {
    changeRotation(1)
    event.stopPropagation()
  }

  function handleRotateCounterClockwise(event: MouseEvent<HTMLDivElement>) {
    changeRotation(-1)
    event.stopPropagation()
  }

  return (
    <div className={`absolute select-none flex`} ref={ref}>
      <div
        className={`w-[${imageWidth}px] h-[${imageHeight}px] box-content cursor-move border-8 border-amber-50 overflow-hidden shadow-md ${isEditingMode ? 'overflow-visible' : 'overflow-hidden'}`}
        style={{ zIndex: order, width: imageWidth, height: imageHeight }}
        onMouseDownCapture={onSelect}
        onDoubleClick={() => setIsEditingMode((isEditingMode) => !isEditingMode)}
      >
        <div
          className={`relative w-fit h-fit ${isEditingMode ? 'opacity-80' : 'opacity-100'}`}
          style={{
            transformOrigin: `${imageWidth / 2} ${imageHeight / 2}`,
          }}
          ref={imageContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={src}
            draggable={false}
            style={{
              maxWidth: 'unset',
              height: 'unset',
            }}
          />
          {isEditingMode && (
            <ResizeHelper onScaling={handleScaling} onScalingFinished={handleScalingFinished} />
          )}
        </div>
      </div>
      {isSelected && (
        <div className='text-pink-600 text-2xl z-[9999]'>
          <div onMouseDown={onDeleteImage}>x</div>
          <div onMouseDown={onRemoveFromWall}>!</div>
          <div onMouseDown={handleRotateClockwise}>{'->'}</div>
          <div onMouseDown={handleRotateCounterClockwise}>{'<-'}</div>
        </div>
      )}
    </div>
  )
}

export default forwardRef(Image)
