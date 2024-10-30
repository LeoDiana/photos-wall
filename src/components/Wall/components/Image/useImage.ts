import { MouseEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { updateImageData } from 'api'
import {
  EDGES,
  MAX_BORDER_HEIGHT,
  MAX_BORDER_WIDTH,
  MIN_BORDER_HEIGHT,
  MIN_BORDER_WIDTH,
} from 'consts'
import useStore from 'store/useStore.ts'
import { DefinedPosition, Dimensions, ImageData, ImageType, Side } from 'types/imageData.ts'
import {
  calcCornersCoords,
  clamp,
  distanceBetweenPoints,
  distanceFromPointToLine,
  findPerpendicularPoint,
  negativeOrZero,
  rotateVector,
} from 'utils/math'
import setPosition from 'utils/styles/setPosition.ts'

import useWallObjects from '../../../../hooks/useWallObjects.ts'
import setDimensions from '../../../../utils/styles/setDimensions.ts'
import setRotation from '../../../../utils/styles/setRotation.ts'

import { calcRescaledDimensions, getCornersDif, getScalingVector } from './rescaleUtils.ts'

// TODO set transform origin to border (offset + half of dismentions)

interface UseImageProps extends Partial<Omit<ImageData, 'type'>> {
  isSelected: boolean
  type: ImageType
  containerRef: HTMLDivElement
}

function useImage({
  id = '',
  originalWidth = 0,
  originalHeight = 0,
  xOffset = 0,
  yOffset = 0,
  scale = 1,
  imageRotation = 0,
  borderRotation = 0,
  isSelected = false,
  type,
  containerRef,
}: UseImageProps) {
  const wallObjects = useWallObjects('123')
  const imageWallObject = wallObjects.images.find((obj) => obj.id === id)!

  const setSelectedImageDataForEditingSection = useStore(
    (state) => state.setSelectedImageDataForEditingSection,
  )

  const [isEditingMode, setIsEditingMode] = useState(false)

  const borderRef = useRef<HTMLDivElement>(null)
  const styledBorderRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const imageInBorderRef = useRef<HTMLDivElement>(null)

  const mouseOffset = useRef({ x: 0, y: 0 }) // mouse offset from top left corner
  const isDragging = useRef(false)

  const currentRotation = useRef(imageRotation)
  const hotCurrentRotation = useRef(imageRotation)

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

  const hotBorderDimensions = useRef<Dimensions>({ width: 0, height: 0 })
  const hotBorderOffset = useRef<DefinedPosition>({ x: 0, y: 0 })

  const currentBorderRotation = useRef(borderRotation)
  const hotBorderRotation = useRef(borderRotation)

  const rect = imageRef.current?.getBoundingClientRect() || { x: 0, y: 0, width: 0, height: 0 }
  const imageCenter = {
    x: rect.x! + rect.width / 2,
    y: rect.y! + rect.height / 2,
  }

  const borderRect = borderRef.current?.getBoundingClientRect() || {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }
  const borderCenter = {
    x: borderRect.x! + borderRect.width / 2,
    y: borderRect.y! + borderRect.height / 2,
  }

  const ratio = originalWidth / originalHeight

  const { wallId } = useParams() as {
    wallId: string
  }

  function updateFullImageData() {
    updateImageData(id, wallId, {
      borderWidth: imageWallObject.borderWidth,
      borderHeight: imageWallObject.borderHeight,
      x: imageWallObject.x,
      y: imageWallObject.y,
      scale: imageWallObject.scale,
      xOffset: imageOffset.current.x,
      yOffset: imageOffset.current.y,
      imageRotation: currentRotation.current,
      borderRotation: currentBorderRotation.current,
    })
  }

  function changeImagePosition({ x, y }: DefinedPosition, isFinished = true) {
    setPosition(imageRef.current, { x, y })
    setPosition(imageInBorderRef.current, { x, y })
    if (isFinished) {
      imageOffset.current = { x, y }
    }
    hotImageOffset.current = { x, y }
  }

  function changeImageDimensions({ width, height }: Dimensions, isFinished = true) {
    setDimensions(imageRef.current, { width, height })
    setDimensions(imageInBorderRef.current, { width, height })
    if (isFinished) {
      imageDimensions.current = { width, height }
    }
    hotImageDimensions.current = { width, height }
    imageWallObject.scale = width / originalWidth
  }

  function changeBorderPosition({ x, y }: DefinedPosition, isFinished = true) {
    setPosition(containerRef, { x, y })

    if (isFinished) {
      imageWallObject.x = x
      imageWallObject.y = y
    }

    hotBorderOffset.current = { x, y }
  }

  function changeBorderDimensions({ width, height }: Dimensions, isFinished = true) {
    setDimensions(borderRef.current, { width, height })
    setDimensions(styledBorderRef.current, { width, height })

    imageRef.current!.style.transformOrigin = `${width / 2}px ${height / 2}px`
    imageInBorderRef.current!.style.transformOrigin = `${width / 2}px ${height / 2}px`

    if (isFinished) {
      imageWallObject.borderWidth = width
      imageWallObject.borderHeight = height
    }
    hotBorderDimensions.current = { width, height }
  }

  function changeImageRotation(angle: number, isFinished = true) {
    setRotation(imageRef.current, angle)
    setRotation(imageInBorderRef.current, angle)
    if (isFinished) {
      currentRotation.current = angle
    }
    hotCurrentRotation.current = angle
    setSelectedImageDataForEditingSection({ imageRotation: angle })
  }

  function changeBorderRotation(angle: number, isFinished = true) {
    setRotation(borderRef.current, angle)
    if (isFinished) {
      currentBorderRotation.current = angle
    }
    hotBorderRotation.current = angle
    setSelectedImageDataForEditingSection({ borderRotation: angle })
  }

  useEffect(() => {
    setIsEditingMode(false)
  }, [isSelected])

  useEffect(() => {
    if (imageRef.current && imageInBorderRef.current && imageWallObject) {
      changeImageDimensions({ width: originalWidth * scale, height: originalHeight * scale })
    }
  }, [originalHeight, scale, originalWidth, imageWallObject])

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
    if (imageWallObject) {
      switch (type) {
        case ImageType.image:
          changeBorderDimensions({
            width: imageWallObject.borderWidth,
            height: imageWallObject.borderHeight,
          })
          break
        case ImageType.sticker:
          changeBorderDimensions({
            width: originalWidth * scale,
            height: originalHeight * scale,
          })
      }
    }
  }, [imageWallObject])

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

    changeImageDimensions(
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
      -(currentRotation.current + currentBorderRotation.current),
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
    movingSides: Side[]
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
    imageWallObject.scale = scaleFactor

    const signX = movingSides.includes(Side.left) ? 1 : 0
    const signY = movingSides.includes(Side.top) ? 1 : 0

    const newXoffset = imageOffset.current.x + (imageDimensions.current.width - actualWidth) * signX
    const newYoffset =
      imageOffset.current.y + (imageDimensions.current.height - actualHeight) * signY

    const {
      A: a,
      B: b,
      C: c,
      D: d,
    } = calcCornersCoords(
      { width: imageWallObject.borderWidth, height: imageWallObject.borderHeight },
      {
        x: 0,
        y: 0,
      },
    )
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
            x: imageWallObject.borderWidth / 2,
            y: imageWallObject.borderHeight / 2,
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
      changeImageDimensions(
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
    movingSides: Side[]
  }) {
    const { width: difW, height: difH } = getCornersDif(difX, -difY, movingSides)

    const suggestedWidth =
      imageWallObject.borderWidth + difW * (movingSides.includes(Side.left) ? -1 : 1)
    const suggestedHeight =
      imageWallObject.borderHeight + difH * (movingSides.includes(Side.top) ? -1 : 1)

    const newWidth = clamp(MIN_BORDER_WIDTH, MAX_BORDER_WIDTH, suggestedWidth)
    const newHeight = clamp(MIN_BORDER_HEIGHT, MAX_BORDER_HEIGHT, suggestedHeight)

    changeBorderDimensions({ width: newWidth, height: newHeight }, false)

    const actualDifX = imageWallObject.borderWidth - newWidth
    const actualDifY = imageWallObject.borderHeight - newHeight

    const newOffsetX = imageWallObject.x + actualDifX * (movingSides.includes(Side.left) ? 1 : 0)
    const newOffsetY = imageWallObject.y + actualDifY * (movingSides.includes(Side.top) ? 1 : 0)

    changeBorderPosition({ x: newOffsetX, y: newOffsetY }, false)

    adjust()
  }

  function handleBorderResizeFinished() {
    changeBorderDimensions(hotBorderDimensions.current)
    changeBorderPosition(hotBorderOffset.current)
    updateFullImageData()
  }

  function handleStickerResize({
    difX,
    difY,
    movingSides,
  }: {
    difX: number
    difY: number
    movingSides: Side[]
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
    imageWallObject.scale = scaleFactor

    changeBorderDimensions({ width: actualWidth, height: actualHeight }, false)
    changeImageDimensions({ width: actualWidth, height: actualHeight }, false)
  }

  function handleStickerResizeFinished() {
    changeBorderDimensions(hotBorderDimensions.current)
    imageDimensions.current = hotImageDimensions.current
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
    const angle = currentBorderRotation.current + diffAngle
    changeBorderRotation(angle, false)
  }

  function handleBorderRotatingFinished() {
    currentBorderRotation.current = hotBorderRotation.current
    updateFullImageData()
  }

  function toggleEditingMode() {
    setIsEditingMode((isEditingMode) => !isEditingMode)
  }

  return {
    isEditingMode,
    toggleEditingMode,
    handleBorderResize,
    handleBorderResizeFinished,
    handleBorderRotating,
    handleBorderRotatingFinished,
    handleScaling,
    handleScalingFinished,
    handleRotating,
    handleRotatingFinished,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    borderCenter,
    imageCenter,
    borderRef,
    imageInBorderRef,
    imageRef,
    styledBorderRef,
    handleStickerResize,
    handleStickerResizeFinished,
  }
}

export default useImage
