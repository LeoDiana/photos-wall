import tw, { styled } from 'twin.macro' // eslint-disable-line import/named

import { Side } from 'types/imageData.ts'

export const CornerElement = styled.div<{ $sides: [Side, Side]; $variant: 'border' | 'image' }>(
  ({ $sides, $variant }) => [
    tw`z-[99999] absolute rounded-full w-3 h-3`,
    cornerVariants[$variant],
    cornersStyles[$sides[0]],
    cornersStyles[$sides[1]],
  ],
)

const cornerVariants = {
  border: tw`bg-purple-400`,
  image: tw`bg-yellow-400`,
}

const cornersStyles = {
  [Side.top]: tw`top-0 -translate-y-1/2`,
  [Side.right]: tw`right-0 translate-x-1/2`,
  [Side.bottom]: tw`bottom-0 translate-y-1/2`,
  [Side.left]: tw`left-0 -translate-x-1/2`,
}
