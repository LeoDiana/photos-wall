import tw, { styled } from 'twin.macro' // eslint-disable-line import/named

import { Side } from 'types/imageData.ts'

export const cornerColorVariants = {
  border: '#f59e0b',
  image: '#ef4444',
}

export const CornerElement = styled.div<{ $sides: [Side, Side] }>(({ $sides }) => [
  tw`z-[99999] absolute`,
  getRotation($sides),
  cornersStyles[$sides[0]],
  cornersStyles[$sides[1]],
])

const cornersStyles = {
  [Side.top]: tw`top-0 -translate-y-0.5`,
  [Side.right]: tw`right-0 translate-x-0.5`,
  [Side.bottom]: tw`bottom-0 translate-y-0.5`,
  [Side.left]: tw`left-0 -translate-x-0.5`,
}

function getRotation(sides: [Side, Side]) {
  if (sides.includes(Side.top) && sides.includes(Side.right)) return tw`rotate-90`
  if (sides.includes(Side.bottom) && sides.includes(Side.right)) return tw`rotate-180`
  if (sides.includes(Side.bottom) && sides.includes(Side.left)) return tw`-rotate-90`
  return tw`rotate-0`
}
