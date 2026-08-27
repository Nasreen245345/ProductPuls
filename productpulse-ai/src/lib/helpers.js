/** Resolves after `ms` milliseconds — stands in for real network latency until FastAPI exists. */
export function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
