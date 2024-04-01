import { MouseEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Sides } from 'types/imageData.ts'

const styles = {
  border: 'bg-purple-400',
  image: 'bg-yellow-400',
}

interface ResizeHelperProps {
  onScaling: (props: { difX: number; difY: number; movingSides: Sides[] }) => void
  onScalingFinished: () => void
  variant: 'border' | 'image'
}

function ResizeHelper({ onScaling, onScalingFinished, variant }: ResizeHelperProps) {
  const [isResizing, setIsResizing] = useState(false)
  const offset = useRef({ x: 0, y: 0 })
  const movingSides = useRef<Sides[]>([])

  function handleMouseDownResize(sides: Sides[]) {
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

    onScaling({
      difX,
      difY: -difY,
      movingSides: movingSides.current,
    })
  }

  function handleMouseUpResize() {
    setIsResizing(false)
    onScalingFinished()
  }

  return (
    <>
      <div
        className={`z-[99999] absolute rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 ${styles[variant]}`}
        onMouseDown={handleMouseDownResize([Sides.top, Sides.right])}
      />
      <div
        className={`z-[99999] absolute rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 ${styles[variant]}`}
        onMouseDown={handleMouseDownResize([Sides.top, Sides.left])}
      />
      <div
        className={`z-[99999] absolute rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 ${styles[variant]}`}
        onMouseDown={handleMouseDownResize([Sides.bottom, Sides.right])}
      />
      <div
        className={`z-[99999] absolute rounded-full bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3 h-3 ${styles[variant]}`}
        onMouseDown={handleMouseDownResize([Sides.bottom, Sides.left])}
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
