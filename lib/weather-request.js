export function createRequestGenerationGuard() {
  let generation = 0
  return {
    next() {
      generation += 1
      return generation
    },
    isCurrent(candidate) {
      return candidate === generation
    },
    invalidate() {
      generation += 1
    },
  }
}
