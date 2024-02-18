import { MouseEvent, useEffect, useRef, useState } from 'react'

import type { Image } from 'types/image.ts'

interface CanvasProps {
  images: Image[]
  onImagePositionChange: (id: string, x: number | null, y: number | null) => void
  selectedImageId: string | null
  setSelectedImageId: (id: string | null) => void
}

type PreloadedImages = {
  [key: string]: HTMLImageElement
}

const DROPZONE_IMAGE_HEIGHT = 100
const DROPZONE_IMAGE_WIDTH = 100
const DROPZONE_BOTTOM_OFFSET = 150

function isImageWithCoords(imageData: Image) {
  return imageData.x !== null && imageData.y !== null
}

function isInDropzone(mouseY: number, canvasHeight: number) {
  return (
    mouseY >= canvasHeight - DROPZONE_BOTTOM_OFFSET &&
    mouseY <= canvasHeight - DROPZONE_BOTTOM_OFFSET + DROPZONE_IMAGE_HEIGHT
  )
}

function isMouseInImageRect(mouseX: number, mouseY: number, imageData: Image) {
  return (
    imageData.x !== null &&
    imageData.y !== null &&
    mouseX >= imageData.x &&
    mouseX <= imageData.x + imageData.width &&
    mouseY >= imageData.y &&
    mouseY <= imageData.y + imageData.height
  )
}

function isMouseInDropzoneImageRect(
  mouseX: number,
  mouseY: number,
  imageOrder: number,
  canvasHeight: number,
) {
  return (
    mouseX >= DROPZONE_IMAGE_WIDTH * imageOrder &&
    mouseX <= DROPZONE_IMAGE_WIDTH * imageOrder + DROPZONE_IMAGE_WIDTH &&
    mouseY >= canvasHeight - DROPZONE_BOTTOM_OFFSET &&
    mouseY <= canvasHeight - DROPZONE_BOTTOM_OFFSET + DROPZONE_IMAGE_HEIGHT
  )
}

function compareByOrder(a: Image, b: Image) {
  return a.order - b.order
}

function Canvas({
  images,
  onImagePositionChange,
  selectedImageId,
  setSelectedImageId,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imagePositions, setImagePositions] = useState<Image[]>([])
  const [dragStartCoords, setDragStartCoords] = useState<{
    x: number
    y: number
  } | null>(null)
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false)
  const [preloadedImages, setPreloadedImages] = useState<PreloadedImages>({})
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [canvasOffset, setCanvasOffset] = useState<{
    x: number
    y: number
  }>({ x: 0, y: 0 })

  // console.log(imagePositions)
  const imagesInDropzone = imagePositions
    .filter((imagePosition) => !isImageWithCoords(imagePosition))
    .sort(compareByOrder)

  useEffect(() => {
    setImagePositions(images.sort(compareByOrder))
  }, [images])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.height = window.innerHeight
    canvas.width = window.innerWidth

    window.addEventListener('resize', function () {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    })

    const context = canvas.getContext('2d')
    if (!context) return

    let imagesToLoad = images.length - Object.keys(preloadedImages).length
    const loadedImages: PreloadedImages = {}

    const onImageLoad = () => {
      imagesToLoad--
      if (imagesToLoad === 0) {
        setPreloadedImages((preloaded) => ({ ...preloaded, ...loadedImages }))
        setImagesLoaded(true)
      }
    }

    const onImageError = (error: string | Event) => {
      console.error('Error loading image:', error)
      onImageLoad()
    }

    images.forEach((imageData) => {
      if (!preloadedImages[imageData.id]) {
        const image = new Image()
        image.src = imageData.src
        image.onload = () => {
          loadedImages[imageData.id] = image
          onImageLoad()
        }
        image.onerror = (error) => {
          onImageError(error)
        }
      }
    })
  }, [images, preloadedImages])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const draw = () => {
      if (!imagesLoaded) return

      context.clearRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = 'green'
      context.fillRect(
        0,
        canvas.height - DROPZONE_BOTTOM_OFFSET,
        canvas.width,
        DROPZONE_IMAGE_HEIGHT,
      )
      imagePositions.forEach((imageData) => {
        if (imageData.x !== null && imageData.y !== null) {
          const image = preloadedImages[imageData.id]
          if (image) {
            context.drawImage(
              image,
              imageData.x + canvasOffset.x,
              imageData.y + canvasOffset.y,
              imageData.width,
              imageData.height,
            )
          }
        }
      })
      imagesInDropzone.forEach((imageData, index) => {
        const image = preloadedImages[imageData.id]
        if (image) {
          context.drawImage(
            image,
            DROPZONE_IMAGE_WIDTH * index,
            canvas.height - DROPZONE_BOTTOM_OFFSET,
            DROPZONE_IMAGE_WIDTH,
            DROPZONE_IMAGE_HEIGHT,
          )
        }
      })
    }

    const animate = () => {
      requestAnimationFrame(animate)
      draw()
    }

    animate()
  }, [canvasOffset, imagePositions, imagesLoaded, preloadedImages, imagesInDropzone])

  const canvas = canvasRef.current
  const context = canvas?.getContext('2d')

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvas || !context) return

    const mouseX = e.clientX - canvas.getBoundingClientRect().left - canvasOffset.x
    const mouseY = e.clientY - canvas.getBoundingClientRect().top - canvasOffset.y

    // Check if any image is clicked
    let imageClicked = false
    for (let i = imagePositions.length - 1; i >= 0; i--) {
      const imageData = imagePositions[i]
      const index = imagesInDropzone.findIndex((a) => a.id === imageData.id)

      let dragCoords = null

      if (isMouseInDropzoneImageRect(mouseX, mouseY, index, canvas.height)) {
        dragCoords = {
          x: mouseX - DROPZONE_IMAGE_WIDTH * index,
          y: mouseY - (canvas.height - DROPZONE_BOTTOM_OFFSET),
        }
      }
      if (isMouseInImageRect(mouseX, mouseY, imageData)) {
        dragCoords = { x: mouseX - imageData.x!, y: mouseY - imageData.y! }
      }

      if (
        isMouseInImageRect(mouseX, mouseY, imageData) ||
        isMouseInDropzoneImageRect(mouseX, mouseY, index, canvas.height)
      ) {
        const updatedImagePositions = [...imagePositions]
        updatedImagePositions.push(updatedImagePositions.splice(i, 1)[0])
        setImagePositions(updatedImagePositions)
        setSelectedImageId(imageData.id)

        setDragStartCoords(dragCoords)
        imageClicked = true
        break
      }
    }

    // If no image is clicked, initiate hand-dragging
    if (!imageClicked) {
      setIsDragging(true)
      setDragStartCoords({ x: mouseX, y: mouseY })
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvas || !context) return

    const canvasX = e.clientX - canvas.getBoundingClientRect().left
    const canvasY = e.clientY - canvas.getBoundingClientRect().top
    const mouseX = canvasX - canvasOffset.x
    const mouseY = canvasY - canvasOffset.y

    if (isInDropzone(canvasY, canvas.height)) {
      setImagePositions((positions) =>
        positions.map((pos) =>
          pos.id === selectedImageId
            ? {
                ...pos,
                x: null,
                y: null,
              }
            : pos,
        ),
      )
      return
    }
    if (selectedImageId !== null && dragStartCoords) {
      const newX = mouseX - dragStartCoords.x
      const newY = mouseY - dragStartCoords.y

      setImagePositions((positions) =>
        positions.map((pos) =>
          pos.id === selectedImageId
            ? {
                ...pos,
                x: newX,
                y: newY,
              }
            : pos,
        ),
      )
    } else if (isDragging && dragStartCoords) {
      // Hand-drag the canvas

      const offsetX = mouseX - dragStartCoords.x
      const offsetY = mouseY - dragStartCoords.y

      setCanvasOffset((prevOffset) => ({
        x: prevOffset.x + offsetX,
        y: prevOffset.y + offsetY,
      }))
    }
  }

  const handleMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvas || !context) return

    if (selectedImageId !== null) {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left - canvasOffset.x
      const mouseY = e.clientY - canvas.getBoundingClientRect().top - canvasOffset.y

      const { x, y } = imagePositions.find((p) => p.id === selectedImageId) || {
        x: mouseX,
        y: mouseY,
      }
      onImagePositionChange(selectedImageId, x, y)
    }
    setSelectedImageId(null)
    setDragStartCoords(null)
    setIsDragging(false)
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        width: '100%',
        height: '100vh',
        display: 'block',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  )
}

export default Canvas
