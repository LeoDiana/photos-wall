import compareByOrder from './compareByOrder.ts'

function getSimplifiedImageOrders(images: { order: number }[]) {
  return images
    .map((img, index) => ({ index, order: img.order }))
    .sort(compareByOrder)
    .reduce((acc, ord, currentIndex) => {
      acc[ord.index] = currentIndex
      return acc
    }, [] as number[])
}

export default getSimplifiedImageOrders
