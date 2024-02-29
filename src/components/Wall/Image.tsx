import { ForwardedRef, forwardRef, MouseEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { updateImageData } from 'api'
import { DefinedPosition, Dimensions, ImageData } from 'types/imageData.ts'
import calculateScaleFactor from 'utils/calculateScaleFactor.ts'
import clamp from 'utils/clamp.ts'

import ResizeHelper from './ResizeHelper.tsx'

const MAX_SCALE = 10

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

  const mouseOffset = useRef({ x: 0, y: 0 }) // mouse offset from start corner (Top Left)
  const isDragging = useRef(false)
  const currentScale = useRef(scale)
  const imageOffset = useRef<DefinedPosition>({ x: 0, y: 0 }) // saved
  const hotImageOffset = useRef<DefinedPosition>({ x: 0, y: 0 }) // in progress
  const currentRotation = useRef(rotation)
  const borderDimensions = useRef<Dimensions>({ width: borderWidth, height: borderHeight })
  const imageDimensions = useRef<Dimensions>({
    width: originalWidth * scale,
    height: originalHeight * scale,
  })
  const hotImageDimensions = useRef<Dimensions>({
    width: originalWidth * scale,
    height: originalHeight * scale,
  })
  const hotBorderDimensions = useRef<Dimensions>({ width: borderWidth, height: borderHeight })

  const { wallId } = useParams() as {
    wallId: string
  }

  function changeImagePosition({ x, y }: DefinedPosition, isFinished = true) {
    imageRef.current!.style.transform = `translate(${x}px, ${y}px)`
    imageContainerRef.current!.style.backgroundPosition = `${x}px ${y}px`
    if (isFinished) {
      imageOffset.current = { x, y }
    }
    hotImageOffset.current = { x, y }
  }

  function changeImageSize({ width, height }: Dimensions, isFinished = true) {
    imageRef.current!.style.width = `${width}px`
    imageRef.current!.style.height = `${height}px`
    imageContainerRef.current!.style.backgroundSize = `${width}px ${height}px`
    if (isFinished) {
      imageDimensions.current = { width, height }
    }
    hotImageDimensions.current = { width, height }
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
      changeImagePosition({ x: xOffset || 0, y: yOffset || 0 })
    }
  }, [xOffset, yOffset, rotation])

  function adjustImagePosition(newOffsetX = 0, newOffsetY = 0, isFinished: boolean) {
    const imageWidth = isFinished ? imageDimensions.current.width : hotImageDimensions.current.width
    const imageHeight = isFinished
      ? imageDimensions.current.height
      : hotImageDimensions.current.height
    const direction = -1 // currentRotation.current < 2 ? -1 : 1
    const directionX = -1 //[1, 2].includes(currentRotation.current) ? 1 : -1
    const maxXOffset = directionX * (imageWidth - borderDimensions.current.width)
    const maxYOffset = direction * (imageHeight - borderDimensions.current.height)
    changeImagePosition(
      {
        x: clamp(Math.min(maxXOffset, 0), Math.max(maxXOffset, 0), newOffsetX),
        y: clamp(Math.min(maxYOffset, 0), Math.max(maxYOffset, 0), newOffsetY),
      },
      isFinished,
    )
  }

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (isEditingMode) {
      isDragging.current = true
      mouseOffset.current = {
        x: event.clientX - imageOffset.current.x,
        y: event.clientY - imageOffset.current.y,
      }
      event.stopPropagation()
    }
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (isDragging.current) {
      hotImageOffset.current = {
        x: event.clientX - mouseOffset.current.x,
        y: event.clientY - mouseOffset.current.y,
      }
      adjustImagePosition(hotImageOffset.current.x, hotImageOffset.current.y, false)
    }
  }

  function handleMouseUp() {
    isDragging.current = false
    imageOffset.current = hotImageOffset.current
    updateImageData(id, wallId, { xOffset: imageOffset.current.x, yOffset: imageOffset.current.y })
  }

  function handleScaling({
    nwCornerDif,
    seCornerDif,
  }: {
    difX: number
    difY: number
    nwCornerDif: DefinedPosition
    seCornerDif: DefinedPosition
  }) {
    const suggestedWidth = imageDimensions.current.width + nwCornerDif.x + seCornerDif.x
    const suggestedHeight = imageDimensions.current.height + nwCornerDif.y + seCornerDif.y

    const scaleX: number = suggestedWidth / imageDimensions.current.width
    const scaleY: number = suggestedHeight / imageDimensions.current.height
    const scale: number = Math.min(scaleX, scaleY)

    const scaledWidth = imageDimensions.current.width * scale
    const scaledHeight = imageDimensions.current.height * scale

    const scaleFactor = clamp(
      calculateScaleFactor(
        originalWidth,
        originalHeight,
        borderDimensions.current.width,
        borderDimensions.current.height,
      ),
      MAX_SCALE,
      calculateScaleFactor(originalWidth, originalHeight, scaledWidth, scaledHeight),
    )
    currentScale.current = scaleFactor

    const actualWidth = originalWidth * scaleFactor
    const actualHeight = originalHeight * scaleFactor

    const signX = nwCornerDif.x ? 1 : 0
    const signY = nwCornerDif.y ? 1 : 0

    const newXoffset = imageOffset.current.x + (imageDimensions.current.width - actualWidth) * signX
    const newYoffset =
      imageOffset.current.y + (imageDimensions.current.height - actualHeight) * signY

    const adjustedWidth = Math.max(-newXoffset + borderDimensions.current.width, actualWidth)
    const adjustedHeight = Math.max(-newYoffset + borderDimensions.current.height, actualHeight)

    const adjustedXoffset = Math.min(0, newXoffset)
    const adjustedYoffset = Math.min(0, newYoffset)

    const wasAdjusted = !(
      adjustedWidth === actualWidth &&
      adjustedHeight === actualHeight &&
      adjustedXoffset === newXoffset &&
      adjustedYoffset === newYoffset
    )

    if (!wasAdjusted) {
      changeImageSize(
        {
          width: adjustedWidth,
          height: adjustedHeight,
        },
        false,
      )

      changeImagePosition(
        {
          x: adjustedXoffset,
          y: adjustedYoffset,
        },
        false,
      )
    }
  }

  function handleScalingFinished() {
    imageOffset.current = hotImageOffset.current
    imageDimensions.current = hotImageDimensions.current
    updateImageData(id, wallId, {
      scale: currentScale.current,
      xOffset: imageOffset.current.x,
      yOffset: imageOffset.current.y,
    })
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
    // adjustImagePosition()
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
