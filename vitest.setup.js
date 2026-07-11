import { beforeEach } from "vitest"

const values = new Map()
const storage = {
  getItem: key => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
  clear: () => values.clear(),
  key: index => [...values.keys()][index] ?? null,
  get length() { return values.size },
}

Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true })
beforeEach(() => storage.clear())
