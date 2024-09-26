function setDimensions(el: HTMLDivElement | null, dimensions: { width?: number; height?: number }) {
  if (!el) {
    return
  }
  if (dimensions.width) {
    el.style.width = `${dimensions.width}px`
  }
  if (dimensions.height) {
    el.style.height = `${dimensions.height}px`
  }
}

export default setDimensions
