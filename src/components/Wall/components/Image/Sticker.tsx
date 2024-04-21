import { ForwardedRef, forwardRef } from 'react'

import { StickerData } from 'types/imageData.ts'

import ResizeHelper from '../ResizeHelper/ResizeHelper.tsx'
import RotateTool from '../RotateTool/RotateTool.tsx'

import {
  BorderContainer,
  ImageContainer,
  ImageElement,
  ImageInsideBorder,
  ImageInsideBorderContainer,
  InnerImageContainer,
} from './styles.ts'
import useImage from './useImage.ts'

interface StickerProps extends StickerData {
  isSelected: boolean
  onSelect: () => void
}

function Sticker(props: StickerProps, ref: ForwardedRef<HTMLDivElement>) {
  const { src, onSelect, isSelected = false, order = 0 } = props

  const {
    isEditingMode,
    toggleEditingMode,
    handleBorderRotating,
    handleBorderRotatingFinished,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    borderCenter,
    borderRef,
    imageInBorderRef,
    imageRef,
    handleStickerResize,
    handleStickerResizeFinished,
  } = useImage(props)

  return (
    <ImageContainer ref={ref}>
      <BorderContainer
        ref={borderRef}
        $order={order}
        onMouseDownCapture={onSelect}
        onDoubleClick={toggleEditingMode}
      >
        {isSelected && (
          <ResizeHelper
            onScaling={handleStickerResize}
            onScalingFinished={handleStickerResizeFinished}
            variant='border'
          />
        )}
        {isEditingMode && (
          <RotateTool
            onRotating={handleBorderRotating}
            onRotatingFinished={handleBorderRotatingFinished}
            center={borderCenter}
          />
        )}
        <InnerImageContainer $isEditingMode={isEditingMode}>
          <ImageInsideBorderContainer>
            <ImageInsideBorder ref={imageInBorderRef} $imgSrc={src} />
          </ImageInsideBorderContainer>
          <ImageElement
            ref={imageRef}
            $imgSrc={src}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          ></ImageElement>
        </InnerImageContainer>
      </BorderContainer>
    </ImageContainer>
  )
}

export default forwardRef(Sticker)
