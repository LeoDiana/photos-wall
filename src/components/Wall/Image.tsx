import { ForwardedRef, forwardRef, MouseEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { updateImageData } from 'api'
import { DefinedPosition, Dimensions, ImageData } from 'types/imageData.ts'
import calculateScaleFactor from 'utils/calculateScaleFactor.ts'
import clamp from 'utils/clamp.ts'
import distanceFromPointToLine from 'utils/distanceFromPointToLine.ts'
import rotatePoint from 'utils/rotatePoint.ts'

import ResizeHelper from './ResizeHelper.tsx'
import RotateTool from './RotateTool.tsx'

const MAX_SCALE = 10
const MIN_BORDER_WIDTH = 50
const MAX_BORDER_WIDTH = 1000
const MIN_BORDER_HEIGHT = 50
const MAX_BORDER_HEIGHT = 1000

interface ImageProps extends ImageData {
  isSelected: boolean
  onSelect: () => void
  onRemoveFromWall: () => void
  onDeleteImage: () => void
}

function Image(
  {
    src,
    x,
    y,
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
    borderOffsetX,
    borderOffsetY,
  }: ImageProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [isEditingMode, setIsEditingMode] = useState(false)

  const borderRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageInBorderRef = useRef<HTMLDivElement>(null)

  const mouseOffset = useRef({ x: 0, y: 0 }) // mouse offset from start corner (Top Left)
  const isDragging = useRef(false)
  const currentScale = useRef(scale)
  const currentRotation = useRef(rotation)

  const imageOffset = useRef<DefinedPosition>({ x: 0, y: 0 }) // saved
  const hotImageOffset = useRef<DefinedPosition>({ x: 0, y: 0 }) // in progress

  const imageDimensions = useRef<Dimensions>({
    width: originalWidth * scale,
    height: originalHeight * scale,
  })
  const hotImageDimensions = useRef<Dimensions>({
    width: originalWidth * scale,
    height: originalHeight * scale,
  })

  const borderDimensions = useRef<Dimensions>({ width: borderWidth, height: borderHeight })
  const hotBorderDimensions = useRef<Dimensions>({ width: borderWidth, height: borderHeight })

  const borderOffset = useRef<DefinedPosition>({ x: 0, y: 0 })
  const hotBorderOffset = useRef<DefinedPosition>({ x: 0, y: 0 })

  const rect = imageRef.current?.getBoundingClientRect()

  const { wallId } = useParams() as {
    wallId: string
  }

  function changeImagePosition({ x, y }: DefinedPosition, isFinished = true) {
    imageRef.current!.style.transform = `translate(${x}px, ${y}px)`
    imageInBorderRef.current!.style.transform = `translate(${x}px, ${y}px)`
    if (isFinished) {
      imageOffset.current = { x, y }
    }
    hotImageOffset.current = { x, y }
  }

  function changeImageSize({ width, height }: Dimensions, isFinished = true) {
    imageRef.current!.style.width = `${width}px`
    imageRef.current!.style.height = `${height}px`
    imageInBorderRef.current!.style.width = `${width}px`
    imageInBorderRef.current!.style.height = `${height}px`
    if (isFinished) {
      imageDimensions.current = { width, height }
    }
    hotImageDimensions.current = { width, height }
    currentScale.current = width / originalWidth
  }

  function changeBorderPosition({ x, y }: DefinedPosition, isFinished = true) {
    borderRef.current!.style.transform = `translate(${x}px, ${y}px)`
    if (isFinished) {
      borderOffset.current = { x, y }
    }
    hotBorderOffset.current = { x, y }
  }

  function changeBorderSize({ width, height }: Dimensions, isFinished = true) {
    borderRef.current!.style.width = `${width}px`
    borderRef.current!.style.height = `${height}px`

    if (isFinished) {
      borderDimensions.current = { width, height }
    }
    hotBorderDimensions.current = { width, height }
  }

  function changeImageRotation(angle: number) {
    imageRef.current!.style.rotate = `${angle}rad`
    imageInBorderRef.current!.style.rotate = `${angle}rad`
    currentRotation.current = angle
  }

  useEffect(() => {
    setIsEditingMode(false)
  }, [isSelected])

  useEffect(() => {
    if (imageRef.current && imageContainerRef.current) {
      changeImageSize({ width: originalWidth * scale, height: originalHeight * scale })
    }
  }, [originalHeight, scale, originalWidth])

  useEffect(() => {
    if (imageRef.current && imageContainerRef.current) {
      changeImageRotation(rotation)
      changeImagePosition({ x: xOffset || 0, y: yOffset || 0 })
    }
  }, [xOffset, yOffset, rotation])

  useEffect(() => {
    if (borderRef.current) {
      changeBorderSize({ width: borderWidth, height: borderHeight })
    }
  }, [borderWidth, borderHeight])

  useEffect(() => {
    if (borderRef.current) {
      changeBorderPosition({ x: borderOffsetX, y: borderOffsetY })
    }
  }, [borderOffsetX, borderOffsetY])

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

  function handleBorderResize({
    nwCornerDif,
    seCornerDif,
  }: {
    difX: number
    difY: number
    nwCornerDif: DefinedPosition
    seCornerDif: DefinedPosition
  }) {
    const suggestedWidth = borderDimensions.current.width + nwCornerDif.x + seCornerDif.x
    const suggestedHeight = borderDimensions.current.height + nwCornerDif.y + seCornerDif.y

    const newWidth = clamp(MIN_BORDER_WIDTH, MAX_BORDER_WIDTH, suggestedWidth)
    const newHeight = clamp(MIN_BORDER_HEIGHT, MAX_BORDER_HEIGHT, suggestedHeight)

    changeBorderSize({ width: newWidth, height: newHeight }, false)

    const newOffsetX = borderOffset.current.x - nwCornerDif.x
    const newOffsetY = borderOffset.current.y - nwCornerDif.y

    changeBorderPosition({ x: newOffsetX, y: newOffsetY }, false)

    const scale = calculateScaleFactor(
      originalWidth,
      originalHeight,
      hotBorderDimensions.current.width,
      hotBorderDimensions.current.height,
    )

    currentScale.current = scale

    changeImageSize({ width: originalWidth * scale, height: originalHeight * scale })
    adjustImagePosition(0, 0, false)
  }

  function handleBorderResizeFinished() {
    borderDimensions.current = hotBorderDimensions.current
    borderOffset.current = hotBorderOffset.current
    updateImageData(id, wallId, {
      borderWidth: borderDimensions.current.width,
      borderHeight: borderDimensions.current.height,
      borderOffsetX: borderOffset.current.x,
      borderOffsetY: borderOffset.current.y,
      scale: currentScale.current,
    })
  }

  function handleRotating(angle: number) {
    currentRotation.current = angle
    changeImageRotation(angle)

    const A = { x: hotImageOffset.current.x, y: hotImageOffset.current.y }
    const B = {
      x: hotImageDimensions.current.width + hotImageOffset.current.x,
      y: hotImageOffset.current.y,
    }
    const C = {
      x: hotImageDimensions.current.width + hotImageOffset.current.x,
      y: hotImageDimensions.current.height + hotImageOffset.current.y,
    }
    const D = {
      x: hotImageOffset.current.x,
      y: hotImageDimensions.current.height + hotImageOffset.current.y,
    }

    const center = {
      x: hotImageDimensions.current.width / 2,
      y: hotImageDimensions.current.height / 2,
    }

    const A1 = rotatePoint(center, A, angle)
    const B1 = rotatePoint(center, B, angle)
    const C1 = rotatePoint(center, C, angle)
    const D1 = rotatePoint(center, D, angle)

    const a = {
      x: 0,
      y: 0,
    }
    const b = {
      x: borderDimensions.current.width,
      y: 0,
    }
    const c = {
      x: borderDimensions.current.width,
      y: borderDimensions.current.height,
    }
    const d = {
      x: 0,
      y: borderDimensions.current.height,
    }

    const corners = [a, b, c, d]
    corners.forEach((corner) => {
      const da = distanceFromPointToLine(D1, A1, corner)
      if (da < 0) {
        changeImagePosition(
          { x: hotImageOffset.current.x + da, y: hotImageOffset.current.y },
          false,
        )
        const ratio = originalWidth / originalHeight
        changeImageSize(
          {
            width: hotImageDimensions.current.width + Math.abs(da),
            height: (hotImageDimensions.current.width + Math.abs(da)) / ratio,
          },
          false,
        )
      }

      const ab = distanceFromPointToLine(A1, B1, corner)
      if (ab < 0) {
        changeImagePosition(
          { x: hotImageOffset.current.x, y: hotImageOffset.current.y + ab },
          false,
        )
        const ratio = originalWidth / originalHeight
        changeImageSize(
          {
            width: (hotImageDimensions.current.height + Math.abs(ab)) * ratio,
            height: hotImageDimensions.current.height + Math.abs(ab),
          },
          false,
        )
      }

      const bc = distanceFromPointToLine(B1, C1, corner)
      if (bc < 0) {
        changeImagePosition(
          { x: hotImageOffset.current.x - bc, y: hotImageOffset.current.y },
          false,
        )
        const ratio = originalWidth / originalHeight
        changeImageSize(
          {
            width: hotImageDimensions.current.width + Math.abs(bc),
            height: (hotImageDimensions.current.width + Math.abs(bc)) / ratio,
          },
          false,
        )
      }

      const cd = distanceFromPointToLine(C1, D1, corner)
      if (cd < 0) {
        changeImagePosition(
          { x: hotImageOffset.current.x, y: hotImageOffset.current.y - cd },
          false,
        )
        const ratio = originalWidth / originalHeight
        changeImageSize(
          {
            width: (hotImageDimensions.current.height + Math.abs(cd)) * ratio,
            height: hotImageDimensions.current.height + Math.abs(cd),
          },
          false,
        )
      }
    })
  }

  function handleRotatingFinished() {
    imageDimensions.current = hotImageDimensions.current
    imageOffset.current = hotImageOffset.current
    updateImageData(id, wallId, {
      xOffset: imageOffset.current.x,
      yOffset: imageOffset.current.y,
      scale: currentScale.current,
      rotation: currentRotation.current,
    })
  }

  return (
    <div className={`absolute select-none flex`} ref={ref}>
      <div
        className={`w-[${borderWidth}px] h-[${borderHeight}px] box-content cursor-move`}
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
          className={`${isEditingMode ? 'overflow-visible' : 'overflow-hidden'}`}
          style={{ width: 'inherit', height: 'inherit' }}
        >
          <div
            ref={imageContainerRef}
            style={{
              width: 'inherit',
              height: 'inherit',
            }}
          >
            <div
              style={{
                width: 'inherit',
                height: 'inherit',
                overflow: 'hidden',
                position: 'absolute',
              }}
            >
              <div
                ref={imageInBorderRef}
                style={{
                  position: 'relative',
                  background: `url(${src}`,
                  backgroundSize: `contain`,
                  width: 'inherit',
                  height: 'inherit',
                }}
              ></div>
            </div>
            <div
              className={`relative w-fit h-fit`}
              style={{
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
              {isEditingMode && (
                <RotateTool
                  onRotating={handleRotating}
                  onRotatingFinished={handleRotatingFinished}
                  center={{
                    x: rect.x! + rect.width / 2,
                    y: rect.y! + rect.height / 2,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default forwardRef(Image)
