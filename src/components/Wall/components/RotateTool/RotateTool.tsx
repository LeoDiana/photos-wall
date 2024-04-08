import { MouseEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Overlay } from 'styles/overlayStyles.ts'
import { DefinedPosition } from 'types/imageData.ts'
import { findRotationAngle } from 'utils/math'

import { RotateIcon } from './styles.ts'

interface RotateToolProps {
  center: DefinedPosition
  onRotating: (angle: number) => void
  onRotatingFinished: () => void
}

function RotateTool({ center, onRotating, onRotatingFinished }: RotateToolProps) {
  const [isRotating, setIsRotating] = useState(false)
  const startCoords = useRef({ x: 0, y: 0 })

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    setIsRotating(true)
    startCoords.current = { x: event.clientX, y: event.clientY }
    event.stopPropagation()
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const angle = findRotationAngle(center, startCoords.current, {
      x: event.clientX,
      y: event.clientY,
    })

    onRotating(angle)
  }

  function handleMouseUp() {
    setIsRotating(false)
    onRotatingFinished()
  }

  return (
    <>
      <RotateIcon onMouseDown={handleMouseDown} />
      {isRotating &&
        createPortal(
          <Overlay onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} />,
          document.getElementById('overlay')!,
        )}
    </>
  )
}

export default RotateTool
