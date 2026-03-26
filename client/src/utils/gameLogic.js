// ── Grid constants ─────────────────────────────────────────────────────────────
export const ROWS    = ['A','B','C','D','E','F','G','H','I','J','K','L','M'];
export const COLS    = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
export const NUM_ROWS = ROWS.length;   // 13
export const NUM_COLS = COLS.length;   // 14

// ── Ship definitions ───────────────────────────────────────────────────────────
// Exactly 6 ships matching the reference image
export const SHIP_DEFS = [
  { id: 'carrier',    name: 'CARRIER',     size: 5, symbol: '🚢' },
  { id: 'battleship', name: 'BATTLESHIP',  size: 4, symbol: '⛴' },
  { id: 'cruiser',    name: 'CRUISER',     size: 3, symbol: '🛳' },
  { id: 'submarine',  name: 'SUBMARINE',   size: 3, symbol: '🤿' },
  { id: 'destroyer',  name: 'DESTROYER',   size: 2, symbol: '⚓' },
  { id: 'patrol',     name: 'PATROL BOAT', size: 2, symbol: '🛥' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
export const cellKey = (row, col) => `${row}${col}`;

export const allCells = () => {
  const cells = [];
  for (const r of ROWS) for (const c of COLS) cells.push(cellKey(r, c));
  return cells;
};

// Returns array of cellKeys the ship would occupy; null if invalid placement
export const getShipCells = (row, col, size, horizontal) => {
  const rIdx = ROWS.indexOf(row);
  const cIdx = COLS.indexOf(col);
  const cells = [];
  for (let i = 0; i < size; i++) {
    const ri = horizontal ? rIdx     : rIdx + i;
    const ci = horizontal ? cIdx + i : cIdx;
    if (ri >= NUM_ROWS || ci >= NUM_COLS) return null;
    cells.push(cellKey(ROWS[ri], COLS[ci]));
  }
  return cells;
};

// ── Random ship placement ──────────────────────────────────────────────────────
export const placeShipsRandomly = () => {
  const occupied = new Set();
  const ships    = [];

  for (const def of SHIP_DEFS) {
    let placed = false;
    let tries  = 0;

    while (!placed && tries < 500) {
      tries++;
      const horizontal = Math.random() < 0.5;
      const rIdx = Math.floor(Math.random() * NUM_ROWS);
      const cIdx = Math.floor(Math.random() * NUM_COLS);
      const cells = getShipCells(ROWS[rIdx], COLS[cIdx], def.size, horizontal);
      if (!cells) continue;

      const hasConflict = cells.some(c => occupied.has(c));
      if (hasConflict) continue;

      cells.forEach(c => occupied.add(c));
      ships.push({ ...def, cells, horizontal, sunk: false });
      placed = true;
    }
  }
  return ships;
};

// ── Build ship map: cellKey → shipId ──────────────────────────────────────────
export const buildShipMap = (ships) => {
  const map = {};
  for (const ship of ships) {
    for (const cell of ship.cells) map[cell] = ship.id;
  }
  return map;
};

// ── Score calculation ──────────────────────────────────────────────────────────
export const calcScore = ({ hits, misses, shipsDestroyed, won, turns, durationSecs }) => {
  let score = 0;
  score += hits * 100;
  score += shipsDestroyed * 500;
  if (won) score += 2000;
  score -= misses * 20;
  score -= Math.floor(durationSecs / 10) * 5;
  score -= Math.max(0, turns - 30) * 10;
  return Math.max(0, score);
};

// ── AI: smart targeting ────────────────────────────────────────────────────────
export class AIPlayer {
  constructor() {
    this.mode      = 'hunt';    // 'hunt' | 'target'
    this.hits      = [];        // all cells AI has hit (ship cells)
    this.queue     = [];        // cells to try next in target mode
    this.tried     = new Set(); // all cells already fired at
    this.hitStreak = [];        // current ship being destroyed
  }

  nextShot() {
    // Target mode: use queue
    while (this.mode === 'target' && this.queue.length > 0) {
      const cell = this.queue.shift();
      if (!this.tried.has(cell)) return cell;
    }

    // Hunt mode: random, prefer checkerboard pattern
    const available = [];
    for (const r of ROWS) {
      for (const c of COLS) {
        const key = cellKey(r, c);
        if (this.tried.has(key)) continue;
        const rIdx = ROWS.indexOf(r);
        const cIdx = COLS.indexOf(c);
        if ((rIdx + cIdx) % 2 === 0) available.push(key);
      }
    }
    if (available.length === 0) {
      // fallback: any untried cell
      for (const r of ROWS) for (const c of COLS) {
        const key = cellKey(r, c);
        if (!this.tried.has(key)) return key;
      }
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  registerResult(cell, isHit, isSunk) {
    this.tried.add(cell);
    if (isHit) {
      this.hits.push(cell);
      this.hitStreak.push(cell);
      if (isSunk) {
        this.hitStreak = [];
        this.queue     = [];
        this.mode      = 'hunt';
      } else {
        this.mode  = 'target';
        this.queue = this._neighbours(cell).filter(c => !this.tried.has(c));

        // If we have 2+ hits in a line, extend that line
        if (this.hitStreak.length >= 2) {
          this.queue = this._lineExtensions(this.hitStreak)
            .filter(c => !this.tried.has(c))
            .concat(this.queue);
        }
        // Deduplicate
        this.queue = [...new Set(this.queue)];
      }
    } else {
      if (this.queue.length === 0 && this.hitStreak.length === 0) {
        this.mode = 'hunt';
      }
    }
  }

  _neighbours(cell) {
    const row = cell[0];
    const col = parseInt(cell.slice(1));
    const rIdx = ROWS.indexOf(row);
    const neighbors = [];
    if (rIdx > 0)          neighbors.push(cellKey(ROWS[rIdx - 1], col));
    if (rIdx < NUM_ROWS-1) neighbors.push(cellKey(ROWS[rIdx + 1], col));
    if (col > 1)           neighbors.push(cellKey(row, col - 1));
    if (col < NUM_COLS)    neighbors.push(cellKey(row, col + 1));
    return neighbors.filter(c => {
      const r = c[0]; const cc = parseInt(c.slice(1));
      return ROWS.includes(r) && COLS.includes(cc);
    });
  }

  _lineExtensions(streak) {
    if (streak.length < 2) return [];
    const r0 = streak[0][0], c0 = parseInt(streak[0].slice(1));
    const r1 = streak[1][0], c1 = parseInt(streak[1].slice(1));
    const horizontal = r0 === r1;
    const cols = streak.map(c => parseInt(c.slice(1)));
    const rows = streak.map(c => ROWS.indexOf(c[0]));
    const extensions = [];
    if (horizontal) {
      const minC = Math.min(...cols); const maxC = Math.max(...cols);
      if (minC > 1)       extensions.push(cellKey(r0, minC - 1));
      if (maxC < NUM_COLS) extensions.push(cellKey(r0, maxC + 1));
    } else {
      const minR = Math.min(...rows); const maxR = Math.max(...rows);
      if (minR > 0)          extensions.push(cellKey(ROWS[minR - 1], c0));
      if (maxR < NUM_ROWS-1) extensions.push(cellKey(ROWS[maxR + 1], c0));
    }
    return extensions;
  }
}
