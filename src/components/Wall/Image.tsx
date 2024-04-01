import { ForwardedRef, forwardRef, MouseEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { updateImageData } from 'api'
import {
  EDGES,
  MAX_BORDER_HEIGHT,
  MAX_BORDER_WIDTH,
  MIN_BORDER_HEIGHT,
  MIN_BORDER_WIDTH,
} from 'consts'
import { DefinedPosition, Dimensions, ImageData, Sides } from 'types/imageData.ts'
import {
  clamp,
  distanceBetweenPoints,
  distanceFromPointToLine,
  findPerpendicularPoint,
  negativeOrZero,
  rotateVector,
  calcCornersCoords,
} from 'utils/math'

import { calcRescaledDimensions, getCornersDif, getScalingVector } from './rescaleUtils.ts'
import ResizeHelper from './ResizeHelper.tsx'
import RotateTool from './RotateTool.tsx'

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
    imageRotation,
    borderRotation,
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
  const imageInBorderRef = useRef<HTMLDivElement>(null)

  const mouseOffset = useRef({ x: 0, y: 0 }) // mouse offset from top left corner
  const isDragging = useRef(false)

  const currentScale = useRef(scale)
  const currentRotation = useRef(imageRotation)
  const hotCurrentRotation = useRef(imageRotation)

  const currentBorderRotation = useRef(borderRotation)

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

  const rect = imageRef.current?.getBoundingClientRect() || { x: 0, y: 0, width: 0, height: 0 }
  const borderRect = borderRef.current?.getBoundingClientRect() || {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }
  const ratio = originalWidth / originalHeight

  const { wallId } = useParams() as {
    wallId: string
  }

  function updateFullImageData() {
    updateImageData(id, wallId, {
      borderWidth: borderDimensions.current.width,
      borderHeight: borderDimensions.current.height,
      borderOffsetX: borderOffset.current.x,
      borderOffsetY: borderOffset.current.y,
      scale: currentScale.current,
      xOffset: imageOffset.current.x,
      yOffset: imageOffset.current.y,
      imageRotation: currentRotation.current,
      borderRotation: currentBorderRotation.current,
    })
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
    imageRef.current!.style.transformOrigin = `${width / 2}px ${height / 2}px`
    imageInBorderRef.current!.style.transformOrigin = `${width / 2}px ${height / 2}px`

    if (isFinished) {
      borderDimensions.current = { width, height }
    }
    hotBorderDimensions.current = { width, height }
  }

  function changeImageRotation(angle: number, isFinished = true) {
    imageRef.current!.style.rotate = `${angle}rad`
    imageInBorderRef.current!.style.rotate = `${angle}rad`
    if (isFinished) {
      currentRotation.current = angle
    }
    hotCurrentRotation.current = angle
  }

  function changeBorderRotation(angle: number) {
    borderRef.current!.style.rotate = `${angle}rad`
    currentBorderRotation.current = angle
  }

  useEffect(() => {
    setIsEditingMode(false)
  }, [isSelected])

  useEffect(() => {
    if (imageRef.current && imageInBorderRef.current) {
      changeImageSize({ width: originalWidth * scale, height: originalHeight * scale })
    }
  }, [originalHeight, scale, originalWidth])

  useEffect(() => {
    if (imageRef.current && imageInBorderRef.current) {
      changeImagePosition({ x: xOffset || 0, y: yOffset || 0 })
    }
  }, [xOffset, yOffset])

  useEffect(() => {
    if (imageRef.current && imageInBorderRef.current) {
      changeImageRotation(imageRotation)
    }
  }, [imageRotation])

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

  useEffect(() => {
    if (borderRef.current) {
      changeBorderRotation(borderRotation)
    }
  }, [borderRotation])

  function adjust() {
    const {
      A: a,
      B: b,
      C: c,
      D: d,
    } = calcCornersCoords(hotBorderDimensions.current, {
      x: 0,
      y: 0,
    })
    const bcorners = [a, b, c, d]

    const corners = calcCornersCoords(
      imageDimensions.current,
      imageOffset.current,
      hotCurrentRotation.current,
      {
        x: hotBorderDimensions.current.width / 2,
        y: hotBorderDimensions.current.height / 2,
      },
    )
    bcorners.forEach((corner) => {
      EDGES.forEach((edge) => {
        const distance = negativeOrZero(
          distanceFromPointToLine(corners[edge.from], corners[edge.to], corner),
        )

        if (distance) {
          const p = findPerpendicularPoint(
            { point1: corners[edge.from], point2: corners[edge.to] },
            corner,
          )
          const v = { x: corner.x - p.x, y: corner.y - p.y }

          corners[edge.from] = { x: corners[edge.from].x + v.x, y: corners[edge.from].y + v.y }
          corners[edge.to] = { x: corners[edge.to].x + v.x, y: corners[edge.to].y + v.y }
        }
      })
    })

    const suggestedWidth = distanceBetweenPoints(corners.A, corners.B)
    const suggestedHeight = distanceBetweenPoints(corners.A, corners.D)
    const w2 = suggestedHeight * ratio
    const h2 = suggestedWidth / ratio
    let newW
    let newH
    if (suggestedWidth - w2 < 0) {
      newW = w2
      newH = suggestedHeight
    } else {
      newW = suggestedWidth
      newH = h2
    }

    changeImageSize(
      {
        width: newW,
        height: newH,
      },
      false,
    )

    changeImagePosition(imageOffset.current, false)
    bcorners.forEach((corner) => {
      const corners = calcCornersCoords(
        hotImageDimensions.current,
        hotImageOffset.current,
        hotCurrentRotation.current,
        {
          x: hotBorderDimensions.current.width / 2,
          y: hotBorderDimensions.current.height / 2,
        },
      )
      const distanceY = negativeOrZero(distanceFromPointToLine(corners.A, corners.B, corner))
      const distanceX = negativeOrZero(distanceFromPointToLine(corners.D, corners.A, corner))

      changeImagePosition(
        { x: hotImageOffset.current.x + distanceX, y: hotImageOffset.current.y + distanceY },
        false,
      )
    })
  }

  function adjustImagePosition(newOffsetX = 0, newOffsetY = 0, isFinished: boolean) {
    const {
      A: a,
      B: b,
      C: c,
      D: d,
    } = calcCornersCoords(hotBorderDimensions.current, {
      x: 0,
      y: 0,
    })
    const corners = [a, b, c, d]

    const { x: _x, y: _y } = rotateVector(
      { x: newOffsetX, y: newOffsetY },
      -currentRotation.current,
    )
    let maxOffsetX = imageOffset.current.x + _x
    let maxOffsetY = imageOffset.current.y + _y

    corners.forEach((corner) => {
      EDGES.forEach((edge) => {
        const corners = calcCornersCoords(
          hotImageDimensions.current,
          {
            x: maxOffsetX,
            y: maxOffsetY,
          },
          currentRotation.current,
          {
            x: hotBorderDimensions.current.width / 2,
            y: hotBorderDimensions.current.height / 2,
          },
        )
        const distance = negativeOrZero(
          distanceFromPointToLine(corners[edge.from], corners[edge.to], corner),
        )

        if (distance) {
          maxOffsetX = maxOffsetX + distance * edge.xOffsetMultiplier
          maxOffsetY = maxOffsetY + distance * edge.yOffsetMultiplier
        }
      })
    })
    changeImagePosition(
      {
        x: maxOffsetX,
        y: maxOffsetY,
      },
      isFinished,
    )
  }

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (isEditingMode) {
      isDragging.current = true
      mouseOffset.current = {
        x: event.clientX,
        y: event.clientY,
      }
      event.stopPropagation()
    }
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (isDragging.current) {
      adjustImagePosition(
        event.clientX - mouseOffset.current.x,
        event.clientY - mouseOffset.current.y,
        false,
      )
    }
  }

  function handleMouseUp() {
    isDragging.current = false
    imageOffset.current = hotImageOffset.current
    updateFullImageData()
  }

  function handleScaling({
    difX,
    difY,
    movingSides,
  }: {
    difX: number
    difY: number
    movingSides: Sides[]
  }) {
    const { width: widthDif, height: heightDif } = getCornersDif(
      difX,
      difY,
      movingSides,
      getScalingVector(movingSides, -currentRotation.current),
    )

    const {
      width: actualWidth,
      height: actualHeight,
      scaleFactor,
    } = calcRescaledDimensions(widthDif, heightDif, imageDimensions.current, {
      width: originalWidth,
      height: originalHeight,
    })
    currentScale.current = scaleFactor

    const signX = movingSides.includes(Sides.left) ? 1 : 0
    const signY = movingSides.includes(Sides.top) ? 1 : 0

    const newXoffset = imageOffset.current.x + (imageDimensions.current.width - actualWidth) * signX
    const newYoffset =
      imageOffset.current.y + (imageDimensions.current.height - actualHeight) * signY

    const {
      A: a,
      B: b,
      C: c,
      D: d,
    } = calcCornersCoords(borderDimensions.current, {
      x: 0,
      y: 0,
    })
    const corners = [a, b, c, d]
    let canBeRescaled = true

    corners.forEach((corner) => {
      EDGES.forEach((edge) => {
        const corners = calcCornersCoords(
          { width: actualWidth, height: actualHeight },
          {
            x: newXoffset,
            y: newYoffset,
          },
          currentRotation.current,
          {
            x: borderDimensions.current.width / 2,
            y: borderDimensions.current.height / 2,
          },
        )
        const distance = negativeOrZero(
          distanceFromPointToLine(corners[edge.from], corners[edge.to], corner),
        )

        if (distance) {
          canBeRescaled = false
        }
      })
    })

    if (canBeRescaled) {
      changeImageSize(
        {
          width: actualWidth,
          height: actualHeight,
        },
        false,
      )

      changeImagePosition(
        {
          x: newXoffset,
          y: newYoffset,
        },
        false,
      )
    }
  }

  function handleScalingFinished() {
    imageOffset.current = hotImageOffset.current
    imageDimensions.current = hotImageDimensions.current
    updateFullImageData()
  }

  function handleBorderResize({
    difX,
    difY,
    movingSides,
  }: {
    difX: number
    difY: number
    movingSides: Sides[]
  }) {
    const { width: difW, height: difH } = getCornersDif(difX, -difY, movingSides)

    const suggestedWidth =
      borderDimensions.current.width + difW * (movingSides.includes(Sides.left) ? -1 : 1)
    const suggestedHeight =
      borderDimensions.current.height + difH * (movingSides.includes(Sides.top) ? -1 : 1)

    const newWidth = clamp(MIN_BORDER_WIDTH, MAX_BORDER_WIDTH, suggestedWidth)
    const newHeight = clamp(MIN_BORDER_HEIGHT, MAX_BORDER_HEIGHT, suggestedHeight)

    changeBorderSize({ width: newWidth, height: newHeight }, false)

    const actualDifX = borderDimensions.current.width - newWidth
    const actualDifY = borderDimensions.current.height - newHeight

    const newOffsetX =
      borderOffset.current.x + actualDifX * (movingSides.includes(Sides.left) ? 1 : 0)
    const newOffsetY =
      borderOffset.current.y + actualDifY * (movingSides.includes(Sides.top) ? 1 : 0)

    changeBorderPosition({ x: newOffsetX, y: newOffsetY }, false)

    adjust()
  }

  function handleBorderResizeFinished() {
    borderDimensions.current = hotBorderDimensions.current
    borderOffset.current = hotBorderOffset.current
    updateFullImageData()
  }

  function handleRotating(diffAngle: number) {
    const angle = currentRotation.current + diffAngle
    changeImageRotation(angle, false)

    adjust()
  }

  function handleRotatingFinished() {
    imageDimensions.current = hotImageDimensions.current
    imageOffset.current = hotImageOffset.current
    currentRotation.current = hotCurrentRotation.current
    updateFullImageData()
  }

  function handleBorderRotating(diffAngle: number) {
    const angle = currentRotation.current + diffAngle
    changeBorderRotation(angle)
  }

  function handleBorderRotatingFinished() {
    // imageDimensions.current = hotImageDimensions.current
    // imageOffset.current = hotImageOffset.current
    // currentRotation.current = hotCurrentRotation.current
    updateFullImageData()
  }

  function toggleEditingMode() {
    setIsEditingMode((isEditingMode) => !isEditingMode)
  }

  return (
    <div className='absolute select-none flex' ref={ref}>
      <div
        className='box-content cursor-move'
        style={{
          zIndex: order,
          width: borderWidth,
          height: borderHeight,
        }}
        onMouseDownCapture={onSelect}
        onDoubleClick={toggleEditingMode}
        ref={borderRef}
      >
        <ResizeHelper
          onScaling={handleBorderResize}
          onScalingFinished={handleBorderResizeFinished}
          variant='border'
        />
        {isEditingMode && (
          <RotateTool
            onRotating={handleBorderRotating}
            onRotatingFinished={handleBorderRotatingFinished}
            center={{
              x: borderRect.x! + borderRect.width / 2,
              y: borderRect.y! + borderRect.height / 2,
            }}
          />
        )}
        <div
          className={`${isEditingMode ? 'overflow-visible' : 'overflow-hidden'}`}
          style={{ width: 'inherit', height: 'inherit' }}
        >
          <div
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
              className='relative w-fit h-fit opacity-50'
              style={{
                background: `url(${src}`,
                backgroundSize: 'contain',
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
