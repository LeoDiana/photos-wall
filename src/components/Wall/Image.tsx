import { ForwardedRef, forwardRef, MouseEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { updateImageData } from 'api'
import { DefinedPosition, Dimensions, ImageData } from 'types/imageData.ts'
import calcCornersCoords from 'utils/calcCornersCoords.ts'
import calculateScaleFactor from 'utils/calculateScaleFactor.ts'
import clamp from 'utils/clamp.ts'
import distanceFromPointToLine from 'utils/distanceFromPointToLine.ts'
import negativeOrZero from 'utils/negativeOrZero.ts'
import rotateVector from 'utils/rotateVector.ts'

import ResizeHelper from './ResizeHelper.tsx'
import RotateTool from './RotateTool.tsx'

const MAX_SCALE = 5
const MIN_BORDER_WIDTH = 50
const MAX_BORDER_WIDTH = 1000
const MIN_BORDER_HEIGHT = 50
const MAX_BORDER_HEIGHT = 1000

const EDGES: Array<{
  from: 'A' | 'B' | 'C' | 'D'
  to: 'A' | 'B' | 'C' | 'D'
  xOffsetMultiplier: number
  yOffsetMultiplier: number
}> = [
  { from: 'D', to: 'A', xOffsetMultiplier: 1, yOffsetMultiplier: 0 },
  { from: 'A', to: 'B', xOffsetMultiplier: 0, yOffsetMultiplier: 1 },
  { from: 'B', to: 'C', xOffsetMultiplier: -1, yOffsetMultiplier: 0 },
  { from: 'C', to: 'D', xOffsetMultiplier: 0, yOffsetMultiplier: -1 },
]

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
    borderOffsetX,
    borderOffsetY,
  }: ImageProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [isEditingMode, setIsEditingMode] = useState(false)

  const borderRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const imageInBorderRef = useRef<HTMLDivElement>(null)

  const mouseOffset = useRef({ x: 0, y: 0 }) // mouse offset from start corner (Top Left)
  const isDragging = useRef(false)
  const currentScale = useRef(scale)
  const currentRotation = useRef(rotation)
  const hotCurrentRotation = useRef(rotation)

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
  const ratio = originalWidth / originalHeight

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

  function changeImageRotation(angle: number, isFinished = true) {
    imageRef.current!.style.rotate = `${angle}rad`
    imageInBorderRef.current!.style.rotate = `${angle}rad`
    if (isFinished) {
      currentRotation.current = angle
    }
    hotCurrentRotation.current = angle
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
    const { A: a, B: b, C: c, D: d } = calcCornersCoords(borderDimensions.current, { x: 0, y: 0 })
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
          { x: maxOffsetX, y: maxOffsetY },
          currentRotation.current,
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
        x: event.clientX, //- imageOffset.current.x,
        y: event.clientY, //- imageOffset.current.y,
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
    updateImageData(id, wallId, { xOffset: imageOffset.current.x, yOffset: imageOffset.current.y })
  }

  function handleScaling({
    nwCornerDif: nw,
    seCornerDif: se,
    vector,
    difX,
    difY,
    movingSides,
  }: {
    difX: number
    difY: number
    nwCornerDif: DefinedPosition
    seCornerDif: DefinedPosition
    vector: DefinedPosition
    movingSides: any
  }) {
    const { x: dx, y: dy } = rotateVector({ x: difX, y: difY }, 0)
    const rotatedVector = rotateVector(vector, -currentRotation.current)
    const isUpscaling =
      Math.sign(dx) === Math.sign(rotatedVector.x) && Math.sign(dy) === Math.sign(rotatedVector.y)
    const dir = 1 //isUpscaling ? 1 : -1
    // const nwCornerDif = rotateVector(nw, -currentRotation.current)
    // const seCornerDif = rotateVector(se, -currentRotation.current)

    const { x: ddx, y: ddy } = rotateVector({ x: difX, y: difY }, -currentRotation.current)

    // console.log(rotatedVector, nwCornerDif, seCornerDif)

    const nwCornerDif = { x: 0, y: 0 }
    const seCornerDif = { x: 0, y: 0 }

    const _signX = rotatedVector.x >= 0 ? 1 : -1
    const _signY = rotatedVector.y >= 0 ? 1 : -1

    if (movingSides.current.includes('n')) {
      nwCornerDif.y = _signY * dy
    }
    if (movingSides.current.includes('e')) {
      seCornerDif.x = _signX * dx
    }
    if (movingSides.current.includes('s')) {
      seCornerDif.y = _signY * dy
    }
    if (movingSides.current.includes('w')) {
      nwCornerDif.x = _signX * dx
    }

    console.log(dx, dy, ddx, ddy)
    console.log(Math.sign(rotatedVector.x) * dx, Math.sign(rotatedVector.y) * dy)
    console.log(nwCornerDif, seCornerDif)

    // nwCornerDif.x = Math.sign(rotatedVector.x) * nwCornerDif.x
    // nwCornerDif.y = Math.sign(rotatedVector.y) * nwCornerDif.y
    // seCornerDif.x = Math.sign(rotatedVector.x) * seCornerDif.x
    // seCornerDif.y = Math.sign(rotatedVector.y) * seCornerDif.y

    // console.log(
    //   isUpscaling ? 'up' : 'down',
    //   nwCornerDif,
    //   seCornerDif,
    //   '|',
    //   difX,
    //   difY,
    //   '||||',
    //   ddx,
    //   ddy,
    //   ((currentRotation.current * 180) / Math.PI) % 360,
    //   '=',
    //   dx,
    //   dy,
    // )

    const suggestedWidth = imageDimensions.current.width + nwCornerDif.x + seCornerDif.x
    const suggestedHeight = imageDimensions.current.height + nwCornerDif.y + seCornerDif.y

    // console.log(suggestedWidth, suggestedHeight, imageDimensions.current)

    const scaleX: number = suggestedWidth / imageDimensions.current.width
    const scaleY: number = suggestedHeight / imageDimensions.current.height
    const scale: number = (scaleX + scaleY) / 2 // Math.min(scaleX, scaleY)

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

    const signX = nw.x ? 1 : 0
    const signY = nw.y ? 1 : 0

    const newXoffset = imageOffset.current.x + (imageDimensions.current.width - actualWidth) * signX
    const newYoffset =
      imageOffset.current.y + (imageDimensions.current.height - actualHeight) * signY

    const { A: a, B: b, C: c, D: d } = calcCornersCoords(borderDimensions.current, { x: 0, y: 0 })
    const corners = [a, b, c, d]
    let wasAdjusted = false

    corners.forEach((corner) => {
      EDGES.forEach((edge) => {
        const corners = calcCornersCoords(
          { width: actualWidth, height: actualHeight },
          { x: newXoffset, y: newYoffset },
          currentRotation.current,
        )
        const distance = negativeOrZero(
          distanceFromPointToLine(corners[edge.from], corners[edge.to], corner),
        )

        if (distance) {
          wasAdjusted = true
        }
      })
    })

    if (!wasAdjusted) {
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

  function findPerpendicularPoint(
    line: {
      point1: DefinedPosition
      point2: DefinedPosition
    },
    point: DefinedPosition,
  ): DefinedPosition {
    const slope = (line.point2.y - line.point1.y) / (line.point2.x - line.point1.x)

    if (slope === 0) {
      return { x: point.x, y: line.point1.y }
    }

    const perpendicularSlope = -1 / slope
    const perpendicularIntercept = point.y - perpendicularSlope * point.x

    const x =
      (perpendicularIntercept - line.point1.y + slope * line.point1.x) /
      (slope - perpendicularSlope)
    const y = slope * (x - line.point1.x) + line.point1.y

    return { x, y }
  }

  function distanceBetweenPoints(p1: DefinedPosition, p2: DefinedPosition): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }

  function handleRotating(diffAngle: number) {
    const angle = currentRotation.current + diffAngle
    changeImageRotation(angle, false)

    const { A: a, B: b, C: c, D: d } = calcCornersCoords(borderDimensions.current, { x: 0, y: 0 })
    const bcorners = [a, b, c, d]

    const corners = calcCornersCoords(
      imageDimensions.current,
      imageOffset.current,
      hotCurrentRotation.current,
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
      )
      const distanceY = negativeOrZero(distanceFromPointToLine(corners.A, corners.B, corner))
      const distanceX = negativeOrZero(distanceFromPointToLine(corners.D, corners.A, corner))

      changeImagePosition(
        { x: hotImageOffset.current.x + distanceX, y: hotImageOffset.current.y + distanceY },
        false,
      )
    })
  }

  function handleRotatingFinished() {
    imageDimensions.current = hotImageDimensions.current
    imageOffset.current = hotImageOffset.current
    currentRotation.current = hotCurrentRotation.current
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
          className={`${isEditingMode ? 'overflow-visible' : 'overflow-visible'}`}
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
                  transformOrigin: `${borderDimensions.current.width / 2}px ${borderDimensions.current.height / 2}px`,
                }}
              ></div>
            </div>
            <div
              className={`relative w-fit h-fit`}
              style={{
                background: `url(${src}`,
                backgroundSize: 'contain',
                opacity: '50%',
                transformOrigin: `${borderDimensions.current.width / 2}px ${borderDimensions.current.height / 2}px`,
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
