import { ForwardedRef, forwardRef, MouseEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { updateImageData } from 'api'
import { ImageData, Position } from 'types/imageData.ts'
import calculateScaleFactor from 'utils/calculateScaleFactor.ts'

interface ImageProps extends ImageData {
  order: number
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
    id,
    onSelect,
    onRemoveFromWall,
    onDeleteImage,
    isSelected = false,
    order = 0,
  }: ImageProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [isEditingMode, setIsEditingMode] = useState(false)

  const imageContainerRef = useRef<HTMLDivElement>(null)
  const position = useRef<Position>({ x: 0, y: 0 })
  const offset = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const currentScale = useRef(scale)
  const imageOffset = useRef({ x: 0, y: 0 })

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
    if (imageRef.current) {
      imageContainerRef.current!.style.left = xOffset + 'px'
      imageContainerRef.current!.style.top = yOffset + 'px'
    }
  }, [xOffset, yOffset])

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

  function clamp(min: number, max: number, value: number) {
    return value <= min ? min : value >= max ? max : value
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (isDragging.current) {
      imageOffset.current = {
        x: clamp(-imageRef.current!.clientWidth + IMAGE_WIDTH, 0, event.clientX - offset.current.x),
        y: clamp(
          -imageRef.current!.clientHeight + IMAGE_HEIGHT,
          0,
          event.clientY - offset.current.y,
        ),
      }
      position.current = {
        x: event.clientX - offset.current.x,
        y: event.clientY - offset.current.y,
      }
      imageContainerRef.current!.style.left = imageOffset.current.x + 'px'
      imageContainerRef.current!.style.top = imageOffset.current.y + 'px'
    }
  }

  function handleMouseUp() {
    isDragging.current = false
    updateImageData(id, wallId, { xOffset: imageOffset.current.x, yOffset: imageOffset.current.y })
  }

  function handleMouseDownResize(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation()
    setIsResizing(true)
    offset.current = {
      x: event.clientX,
      y: event.clientY,
    }
  }

  function handleMouseMoveResize(event: MouseEvent<HTMLDivElement>) {
    const difX = event.clientX - offset.current.x
    currentScale.current = clamp(
      calculateScaleFactor(originalWidth, originalHeight, IMAGE_WIDTH, IMAGE_HEIGHT),
      1,
      (originalWidth * scale + difX) / originalWidth,
    )
    if (imageRef.current) {
      imageRef.current.style.width = originalWidth * currentScale.current + 'px'
      imageRef.current.style.height = originalHeight * currentScale.current + 'px'
    }
  }

  function handleMouseUpResize(event: MouseEvent<HTMLDivElement>) {
    setIsResizing(false)
    updateImageData(id, wallId, { scale: currentScale.current })
    event.stopPropagation()
  }

  return (
    <div className={`absolute select-none flex`} ref={ref}>
      <div
        className={`w-[${IMAGE_WIDTH}px] h-[${IMAGE_HEIGHT}px] box-content cursor-move border-8 border-amber-50 overflow-hidden shadow-md ${isEditingMode ? 'overflow-visible' : 'overflow-hidden'}`}
        style={{ zIndex: order }}
        onMouseDownCapture={onSelect}
        onDoubleClick={() => setIsEditingMode((isEditingMode) => !isEditingMode)}
      >
        <div
          className={`relative ${isEditingMode ? 'opacity-80' : 'opacity-100'}`}
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
        </div>
      </div>
      {isSelected && (
        <div className='text-pink-600 text-2xl z-[9999]'>
          <div onMouseDown={onDeleteImage}>x</div>
          <div onMouseDown={onRemoveFromWall}>!</div>
        </div>
      )}
      {isEditingMode && (
        <>
          <div
            className='text-purple-600 text-2xl z-[9999] cursor-nesw-resize absolute top-2 right-4 bg-red-500 w-10 h-10'
            onMouseDown={handleMouseDownResize}
            onMouseUp={handleMouseUpResize}
          />
          {isResizing && (
            <div
              onMouseUp={handleMouseUpResize}
              onMouseMove={handleMouseMoveResize}
              className={
                'fixed opacity-5 top-0 left-0 w-screen h-screen bg-rose-400 z-[9999] cursor-nesw-resize'
              }
            />
          )}
        </>
      )}
    </div>
  )
}

export default forwardRef(Image)
