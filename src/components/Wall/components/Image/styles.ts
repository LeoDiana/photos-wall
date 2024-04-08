import tw, { styled, css } from 'twin.macro' // eslint-disable-line import/named

import { withBackground } from 'styles/utilStyles.ts'
import { FrameStyle } from 'types/imageData.ts'

export const BorderContainer = styled.div<{
  $order: number
}>(({ $order }) => [
  tw`box-content cursor-move`,
  css`
    z-index: ${$order};
  `,
])

const frameStyles = {
  [FrameStyle.none]: tw``,
  [FrameStyle.border]: tw`border-8 border-white`,
}

export const ImageContainer = tw.div`absolute select-none flex`
export const ImageElement = styled.div<{
  $imgSrc: string | null
}>(({ $imgSrc }) => [
  tw`relative w-fit h-fit opacity-50 bg-contain`,
  withBackground({ imgSrc: $imgSrc }),
])

export const ImageInsideBorder = styled.div<{
  $imgSrc: string | null
}>(({ $imgSrc }) => [tw`relative bg-cover`, withBackground({ imgSrc: $imgSrc })])

export const ImageInsideBorderContainer = tw.div`overflow-hidden absolute w-[inherit] h-[inherit]`

export const InnerImageContainer = styled.div<{ $isEditingMode: boolean }>(
  ({ $isEditingMode = false }) => [
    tw`w-[inherit] h-[inherit] overflow-hidden`,
    $isEditingMode && tw`overflow-visible`,
  ],
)

export const StyledBorder = styled.div<{
  $order: number
  $variant: FrameStyle
}>(({ $order, $variant }) => [
  tw`absolute top-0 left-0`,
  frameStyles[$variant],
  css`
    z-index: ${$order};
  `,
])
