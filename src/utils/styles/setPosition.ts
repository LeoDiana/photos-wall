function setPosition(ref: HTMLDivElement | null, position: { x?: number; y?: number }) {
  if (!ref) {
    return
  }
  ref.style.transform = `translate(${position?.x || 0}px, ${position?.y || 0}px)`
}

export default setPosition
