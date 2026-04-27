// src/utils/normalizeFrames.js
export function normalizeFrames(frames) {
  if (!Array.isArray(frames)) return []
  return frames.map(items =>
    Array.isArray(items)
      ? items.map(it => ({
          text: it?.text ?? '',
          row: Number.isFinite(it?.row) ? it.row : 1,
          col: Number.isFinite(it?.col) ? it.col : 1,
          center: Boolean(it?.center)
        }))
      : []
  )
}
