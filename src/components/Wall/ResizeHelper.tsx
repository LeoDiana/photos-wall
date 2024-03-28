import { MouseEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { DefinedPosition } from 'types/imageData.ts'

const styles = {
  border: 'bg-purple-400',
  image: 'bg-yellow-400',
}

interface ResizeHelperProps {
  onScaling: (props: {
    nwCornerDif: DefinedPosition
    seCornerDif: DefinedPosition
    vector: DefinedPosition
    difX: number
    difY: number
  }) => void
  onScalingFinished: () => void
  variant: 'border' | 'image'
}

function ResizeHelper({ onScaling, onScalingFinished, variant }: ResizeHelperProps) {
  const [isResizing, setIsResizing] = useState(false)
  const offset = useRef({ x: 0, y: 0 })
  const movingSides = useRef<string[]>([])

  function handleMouseDownResize(sides: string[]) {
    return (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation()
      setIsResizing(true)
      offset.current = {
        x: event.clientX,
        y: event.clientY,
      }
      movingSides.current = sides
    }
  }

  function handleMouseMoveResize(event: MouseEvent<HTMLDivElement>) {
    const difX = event.clientX - offset.current.x
    const difY = event.clientY - offset.current.y
    const nwCornerDif = { x: 0, y: 0 }
    const seCornerDif = { x: 0, y: 0 }
    const vector = { x: 0, y: 0 }

    if (movingSides.current.includes('n')) {
      nwCornerDif.y = -difY
      vector.y = 1
    }
    if (movingSides.current.includes('e')) {
      seCornerDif.x = difX
      vector.x = 1
    }
    if (movingSides.current.includes('s')) {
      seCornerDif.y = difY
      vector.y = -1
    }
    if (movingSides.current.includes('w')) {
      nwCornerDif.x = -difX
      vector.x = -1
    }
    onScaling({ nwCornerDif, seCornerDif, difX, difY: -difY, vector })
  }

  function handleMouseUpResize() {
    setIsResizing(false)
    onScalingFinished()
  }

  return (
    <>
      <div
        className={`z-[99999] absolute rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 ${styles[variant]}`}
        onMouseDown={handleMouseDownResize(['n', 'e'])}
      />
      <div
        className={`z-[99999] absolute rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 ${styles[variant]}`}
        onMouseDown={handleMouseDownResize(['n', 'w'])}
      />
      <div
        className={`z-[99999] absolute rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 ${styles[variant]}`}
        onMouseDown={handleMouseDownResize(['s', 'e'])}
      />
      <div
        className={`z-[99999] absolute rounded-full bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3 h-3 ${styles[variant]}`}
        onMouseDown={handleMouseDownResize(['s', 'w'])}
      />
      {isResizing &&
        createPortal(
          <div
            onMouseUp={handleMouseUpResize}
            onMouseMove={handleMouseMoveResize}
            className={'fixed opacity-40 top-0 left-0 w-screen h-screen z-[999999]'}
          />,
          document.getElementById('overlay')!,
        )}
    </>
  )
}

export default ResizeHelper
