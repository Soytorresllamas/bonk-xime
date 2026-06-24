export const TILE_W = 64; // width of one tile (left-right span of diamond)
export const TILE_H = 32; // height of one tile (top-bottom span of diamond)

// Convert grid tile (col, row) to screen (x, y), offset by origin.
export function tileToScreen(col, row, originX = 0, originY = 0) {
  return {
    x: (col - row) * (TILE_W / 2) + originX,
    y: (col + row) * (TILE_H / 2) + originY,
  };
}

// True if b is in the 8-direction neighborhood of a (not same tile).
export function isAdjacent(a, b) {
  const dc = Math.abs(a.col - b.col);
  const dr = Math.abs(a.row - b.row);
  return dc <= 1 && dr <= 1 && !(dc === 0 && dr === 0);
}

// The 4 orthogonal neighbors of (col, row) — used for Chain Bonk.
export function getOrthogonalNeighbors(col, row) {
  return [
    { col: col - 1, row },
    { col: col + 1, row },
    { col, row: row - 1 },
    { col, row: row + 1 },
  ];
}

// Depth value for correct iso draw order (higher = drawn in front).
export function isoDepth(col, row) {
  return col + row;
}
