import { ForwardedRef, forwardRef } from 'react'

interface ImageProps {
  src: string
  order: number
  isSelected: boolean
  onSelect: () => void
  onRemoveFromWall: () => void
  onDeleteImage: () => void
}

function Image(
  { src, onSelect, onRemoveFromWall, onDeleteImage, isSelected = false, order = 0 }: ImageProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div className={`absolute select-none flex`} ref={ref}>
      <div
        className={`w-[250px] h-[250px] cursor-move`}
        style={{ zIndex: order }}
        onMouseDownCapture={() => onSelect()}
      >
        <img src={src} draggable={false} />
      </div>
      {isSelected && (
        <div className='text-pink-600 text-2xl z-[9999]'>
          <div onMouseDown={onDeleteImage}>x</div>
          <div onMouseDown={onRemoveFromWall}>!</div>
        </div>
      )}
    </div>
  )
}

export default forwardRef(Image)
