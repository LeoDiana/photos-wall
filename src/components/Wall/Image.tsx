import { ForwardedRef, forwardRef, MouseEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { updateImageData } from 'api'
import { DefinedPosition, Dimensions, ImageData } from 'types/imageData.ts'
import calculateScaleFactor from 'utils/calculateScaleFactor.ts'
import clamp from 'utils/clamp.ts'

import ResizeHelper from './ResizeHelper.tsx'

interface ImageProps extends ImageData {
  isSelected: boolean
  onSelect: () => void
  onRemoveFromWall: () => void
  onDeleteImage: () => void
}

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
    borderHeight,
    borderWidth,
  }: ImageProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [isEditingMode, setIsEditingMode] = useState(false)

  const borderRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const position = useRef<DefinedPosition>({ x: 0, y: 0 })
  const offset = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const currentScale = useRef(scale)
  const imageOffset = useRef<DefinedPosition>({ x: 0, y: 0 })
  const currentRotation = useRef(rotation)
  const borderDimensions = useRef<Dimensions>({ width: borderWidth, height: borderHeight })
  const imageDimensions = useRef<Dimensions>({
    width: originalWidth * scale,
    height: originalHeight * scale,
  })
  const hotBorderDimensions = useRef<Dimensions>({ width: borderWidth, height: borderHeight })

  const { wallId } = useParams() as {
    wallId: string
  }

  function changeImagePosition({ x, y }: DefinedPosition) {
    imageRef.current!.style.left = `${x}px`
    imageRef.current!.style.top = `${y}px`
    imageContainerRef.current!.style.backgroundPosition = `${x}px ${y}px`
    imageOffset.current = { x, y }
  }

  function changeImageSize({ width, height }: Dimensions) {
    imageDimensions.current = { width, height }
    imageRef.current!.style.width = `${width}px`
    imageRef.current!.style.height = `${height}px`
    imageContainerRef.current!.style.backgroundSize = `${width}px ${height}px`
  }

  useEffect(() => {
    setIsEditingMode(false)
  }, [isSelected])

  useEffect(() => {
    if (imageRef.current) {
      changeImageSize({ width: originalWidth * scale, height: originalHeight * scale })
    }
  }, [originalHeight, scale, originalWidth])

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current!.style.rotate = `${rotation * 90}deg`
      changeImagePosition({ x: xOffset, y: yOffset })
    }
  }, [xOffset, yOffset, rotation])

  function adjustImagePosition(mouseX = 0, mouseY = 0) {
    const imgElementHeight = imageDimensions.current.height
    const imgElementWidth = imageDimensions.current.width
    const direction = currentRotation.current < 2 ? -1 : 1
    const directionX = [1, 2].includes(currentRotation.current) ? 1 : -1
    const maxXOffset = directionX * (imgElementWidth - borderDimensions.current.width)
    const maxYOffset = direction * (imgElementHeight - borderDimensions.current.height)
    imageOffset.current = {
      x: clamp(Math.min(maxXOffset, 0), Math.max(maxXOffset, 0), mouseX - offset.current.x),
      y: clamp(Math.min(maxYOffset, 0), Math.max(maxYOffset, 0), mouseY - offset.current.y),
    }
    changeImagePosition(imageOffset.current)
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
      calculateScaleFactor(
        originalWidth,
        originalHeight,
        borderDimensions.current.width,
        borderDimensions.current.height,
      ),
      100,
      (originalWidth * scale + diff) / originalWidth,
    )
    if (imageRef.current) {
      changeImageSize({
        width: originalWidth * currentScale.current,
        height: originalHeight * currentScale.current,
      })
      adjustImagePosition()
    }
  }

  function handleScalingFinished() {
    updateImageData(id, wallId, { scale: currentScale.current })
  }

  function handleBorderResize(diffX: number, diffY: number) {
    const newWidth = clamp(
      0,
      imageDimensions.current.width + imageOffset.current.x,
      borderDimensions.current.width + diffX,
    )
    const newHeight = clamp(
      0,
      imageDimensions.current.height + imageOffset.current.y,
      borderDimensions.current.height + diffY,
    )
    borderRef.current!.style.width = `${newWidth}px`
    imageContainerRef.current!.style.width = `${newWidth}px`

    borderRef.current!.style.height = `${newHeight}px`
    imageContainerRef.current!.style.height = `${newHeight}px`

    hotBorderDimensions.current = { width: newWidth, height: newHeight }
  }

  function handleBorderResizeFinished() {
    borderDimensions.current = hotBorderDimensions.current
    updateImageData(id, wallId, {
      borderWidth: borderDimensions.current.width,
      borderHeight: borderDimensions.current.height,
    })
  }

  function changeRotation(rotationDirection: number) {
    currentRotation.current = (4 + currentRotation.current + rotationDirection) % 4
    imageRef.current!.style.rotate = `${currentRotation.current * 90}deg`
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
        className={`w-[${borderWidth}px] h-[${borderHeight}px] box-content cursor-move overflow-hidden ${isEditingMode ? 'overflow-visible' : 'overflow-hidden'}`}
        style={{
          zIndex: order,
          width: borderWidth,
          height: borderHeight,
        }}
        onMouseDownCapture={onSelect}
        onDoubleClick={() => setIsEditingMode((isEditingMode) => !isEditingMode)}
        ref={borderRef}
      >
        <ResizeHelper
          onScaling={handleBorderResize}
          onScalingFinished={handleBorderResizeFinished}
          variant='border'
        />
        <div
          ref={imageContainerRef}
          style={{
            background: `url(${src}`,
            backgroundSize: `${originalWidth * scale}px ${originalHeight * scale}px`,
            width: borderWidth,
            height: borderHeight,
          }}
        >
          <div
            className={`relative w-fit h-fit`}
            style={{
              transformOrigin: `${borderWidth / 2}px ${borderHeight / 2}px`,
              background: `url(${src}`,
              backgroundSize: 'contain',
              opacity: '50%',
            }}
            ref={imageRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {isEditingMode && (
              <ResizeHelper
                onScaling={handleScaling}
                onScalingFinished={handleScalingFinished}
                variant='image'
              />
            )}
          </div>
        </div>
      </div>
      {/* {isSelected && ( */}
      {/*   <div className='text-pink-600 text-2xl z-[9999]'> */}
      {/*     <div onMouseDown={onDeleteImage}>x</div> */}
      {/*     <div onMouseDown={onRemoveFromWall}>!</div> */}
      {/*     <div onMouseDown={handleRotateClockwise}>{'->'}</div> */}
      {/*     <div onMouseDown={handleRotateCounterClockwise}>{'<-'}</div> */}
      {/*   </div> */}
      {/* )} */}
    </div>
  )
}

export default forwardRef(Image)
