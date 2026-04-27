// Kompakte Grid-Helfer

export function computeCenteredCol(totalCols, cspan = 1) {
  const start = Math.floor((totalCols - cspan) / 2) + 1
  return Math.max(1, Math.min(start, Math.max(1, totalCols - cspan + 1)))
}

export function materializeGrid(item, totalCols) {
  const row   = Math.max(1, Number(item?.row ?? 1))
  const col   = Math.max(1, Number(item?.col ?? 1))
  const rspan = Math.max(1, Number(item?.rspan ?? 1))
  const cspan = Math.max(1, Number(item?.cspan ?? 1))
  const finalCol = item?.center ? computeCenteredCol(totalCols, cspan) : col

  return {
    gridRow: row,
    gridCol: finalCol,
    rspan,
    cspan,
    gridArea: `${row} / ${finalCol} / span ${rspan} / span ${cspan}`,
  }
}

export function applyGrid(item, totalCols) {
  const g = materializeGrid(item, totalCols)
  item.gridRow  = g.gridRow
  item.gridCol  = g.gridCol
  item.rspan    = g.rspan
  item.cspan    = g.cspan
  item.gridArea = g.gridArea
  return item
}
