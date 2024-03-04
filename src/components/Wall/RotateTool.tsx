import { MouseEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { DefinedPosition } from 'types/imageData.ts'

import { findRotationAngle } from '../../utils/findRotationAngle.ts'

interface RotateToolProps {
  center: DefinedPosition
  onRotating: (angle: number) => void
  onRotatingFinished: () => void
}

function RotateTool({ center, onRotating, onRotatingFinished }: RotateToolProps) {
  const [isRotating, setIsRotating] = useState(false)
  const rotation = useRef()
  const startCoords = useRef({ x: 0, y: 0 })

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    setIsRotating(true)
    startCoords.current = { x: event.clientX, y: event.clientY }
    event.stopPropagation()
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    console.log('ceter', center)
    const angle = findRotationAngle(center, startCoords.current, {
      x: event.clientX,
      y: event.clientY,
    })

    // console.log(angle, angle * (180 / Math.PI), center, event.clientX, event.clientY)
    onRotating(angle)

    // const difX = event.clientX - offset.current.x
    // const difY = event.clientY - offset.current.y
    // const nwCornerDif = { x: 0, y: 0 }
    // const seCornerDif = { x: 0, y: 0 }

    // if (movingSides.current.includes('n')) {
    //   nwCornerDif.y = -difY
    // }
    // if (movingSides.current.includes('e')) {
    //   seCornerDif.x = difX
    // }
    // if (movingSides.current.includes('s')) {
    //   seCornerDif.y = difY
    // }
    // if (movingSides.current.includes('w')) {
    //   nwCornerDif.x = -difX
    // }
    // onScaling({ nwCornerDif, seCornerDif, difX, difY })
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
