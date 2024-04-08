import { MouseEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Overlay } from 'styles/overlayStyles.ts'
import { Side } from 'types/imageData.ts'

import { CornerElement } from './styles.ts'

const corners: [Side, Side][] = [
  [Side.top, Side.right],
  [Side.top, Side.left],
  [Side.bottom, Side.right],
  [Side.bottom, Side.left],
]

interface ResizeHelperProps {
  onScaling: (props: { difX: number; difY: number; movingSides: Side[] }) => void
  onScalingFinished: () => void
  variant: 'border' | 'image'
}

function ResizeHelper({ onScaling, onScalingFinished, variant }: ResizeHelperProps) {
  const [isResizing, setIsResizing] = useState(false)
  const offset = useRef({ x: 0, y: 0 })
  const movingSides = useRef<Side[]>([])

  function handleMouseDownResize(sides: Side[]) {
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
      {corners.map((corner) => (
        <CornerElement
          key={corner.toString()}
          $sides={corner}
          $variant={variant}
          onMouseDown={handleMouseDownResize(corner)}
        />
      ))}
      {isResizing &&
        createPortal(
          <Overlay onMouseUp={handleMouseUpResize} onMouseMove={handleMouseMoveResize} />,
          document.getElementById('overlay')!,
        )}
    </>
  )
}

export default ResizeHelper
