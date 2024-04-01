import { MouseEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { DefinedPosition } from 'types/imageData.ts'
import { findRotationAngle } from 'utils/math'

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
      <div
        className='z-[99999] absolute rounded-full bg-purple-600 w-6 h-6 -bottom-8 -translate-x-1/2 left-1/2'
        onMouseDown={handleMouseDown}
      ></div>
      {isRotating &&
        createPortal(
          <div
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={'fixed opacity-40 top-0 left-0 w-screen h-screen z-[999999]'}
          />,
          document.getElementById('overlay')!,
        )}
    </>
  )
}

export default RotateTool
