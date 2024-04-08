import tw, { styled } from 'twin.macro' // eslint-disable-line import/named

export const Container = styled.div<{ $isExpanded: boolean }>(({ $isExpanded = true }) => [
  tw`bg-neutral-800 h-screen fixed left-0 top-0 z-10 flex flex-row border border-l-[1px] border-neutral-900 w-20`,
  $isExpanded && tw`w-[434px]`,
])

export const ExpandButton = tw.div`bg-neutral-800 absolute right-0 translate-x-1/2 h-14 w-6 top-1/2 -translate-y-1/2 rounded-xl flex items-center p-1 justify-end select-none -z-10`

export const IconContainer = tw.div`w-[40px] h-[40px]`

export const SectionButton = styled.div<{ $shouldBeHighlighted: boolean }>(
  ({ $shouldBeHighlighted = false }) => [
    tw`w-20 h-20 text-xs flex flex-col items-center justify-center`,
    $shouldBeHighlighted && tw`bg-neutral-800`,
  ],
)
export const SectionButtonsContainer = tw.div`bg-neutral-900 w-20 h-screen border border-l-[1px] border-neutral-800`
export const SectionContainer = tw.div`grow p-4 pb-0`
