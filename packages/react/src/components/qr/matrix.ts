/**
 * QR Code matrix construction — module placement, masking, format/version info.
 *
 * @internal
 */

import {
  type ECLevel,
  getSize,
  ALIGNMENT_POSITIONS,
  getFormatInfo,
  getVersionInfo,
} from "./tables";

/** Module values: false = light, true = dark */
export type QRMatrix = boolean[][];

/** Create a size x size matrix filled with null (unset) */
const createGrid = (size: number): (boolean | null)[][] =>
  Array.from({ length: size }, () => new Array(size).fill(null));

/** Place finder pattern (7x7) at the given top-left corner */
const placeFinder = (
  grid: (boolean | null)[][],
  row: number,
  col: number,
  size: number
): void => {
  // Place 7x7 finder + 1-module separator
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const mr = row + r;
      const mc = col + c;
      if (mr < 0 || mr >= size || mc < 0 || mc >= size) continue;

      const isSeparator = r === -1 || r === 7 || c === -1 || c === 7;
      if (isSeparator) {
        grid[mr][mc] = false;
        continue;
      }
      const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
      const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      grid[mr][mc] = isBorder || isInner;
    }
  }
};

/** Place alignment pattern (5x5) centered at (row, col) */
const placeAlignment = (
  grid: (boolean | null)[][],
  row: number,
  col: number
): void => {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      grid[row + r][col + c] = isBorder || isCenter;
    }
  }
};

/** Check if a position overlaps with finder patterns (including separators) */
const overlapsFinder = (row: number, col: number, size: number): boolean => {
  if (row <= 8 && col <= 8) return true;
  if (row <= 8 && col >= size - 8) return true;
  if (row >= size - 8 && col <= 8) return true;
  return false;
};

/** Place timing patterns (row 6 and column 6) */
const placeTiming = (grid: (boolean | null)[][], size: number): void => {
  for (let i = 8; i < size - 8; i++) {
    const dark = i % 2 === 0;
    if (grid[6][i] === null) grid[6][i] = dark;
    if (grid[i][6] === null) grid[i][6] = dark;
  }
};

/** Reserve format info areas (set to false as placeholder) */
const reserveFormatAreas = (grid: (boolean | null)[][], size: number): void => {
  // Around top-left finder
  for (let i = 0; i < 9; i++) {
    if (grid[8][i] === null) grid[8][i] = false;
    if (grid[i][8] === null) grid[i][8] = false;
  }
  // Around top-right finder
  for (let i = 0; i < 8; i++) {
    if (grid[8][size - 1 - i] === null) grid[8][size - 1 - i] = false;
  }
  // Around bottom-left finder
  for (let i = 0; i < 7; i++) {
    if (grid[size - 1 - i][8] === null) grid[size - 1 - i][8] = false;
  }
  // Dark module
  grid[size - 8][8] = true;
};

/** Reserve version info areas for versions >= 7 */
const reserveVersionAreas = (
  grid: (boolean | null)[][],
  size: number,
  version: number
): void => {
  if (version < 7) return;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[size - 11 + c][r] === null) grid[size - 11 + c][r] = false;
      if (grid[r][size - 11 + c] === null) grid[r][size - 11 + c] = false;
    }
  }
};

/**
 * Place data bits into the matrix using the upward zigzag pattern.
 * Only fills cells that are still null (unreserved).
 */
const placeData = (grid: (boolean | null)[][], bits: number[]): void => {
  const size = grid.length;
  let bitIdx = 0;
  // Start from rightmost column, move left in pairs
  let col = size - 1;
  while (col >= 0) {
    if (col === 6) col--; // Skip timing column

    // Determine direction: first pair goes up, alternates
    const goingUp = ((size - 1 - col) & 2) === 0;

    for (let i = 0; i < size; i++) {
      const row = goingUp ? size - 1 - i : i;

      // Right column of pair
      if (grid[row][col] === null) {
        grid[row][col] = bitIdx < bits.length ? bits[bitIdx] === 1 : false;
        bitIdx++;
      }
      // Left column of pair
      if (col - 1 >= 0 && grid[row][col - 1] === null) {
        grid[row][col - 1] = bitIdx < bits.length ? bits[bitIdx] === 1 : false;
        bitIdx++;
      }
    }
    col -= 2;
  }
};

/** The 8 mask pattern functions (ISO 18004 Table 10) */
const MASK_FNS: ((row: number, col: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  r => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

/**
 * Build a boolean matrix from the grid, applying a mask to data modules.
 * Function pattern modules (non-null in the original grid before data placement)
 * are NOT masked.
 */
const applyMask = (
  grid: (boolean | null)[][],
  functionGrid: (boolean | null)[][],
  maskIdx: number
): QRMatrix => {
  const size = grid.length;
  const fn = MASK_FNS[maskIdx];
  const result: QRMatrix = Array.from({ length: size }, () =>
    new Array(size).fill(false)
  );
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = grid[r][c] === true;
      // Only mask data modules (cells that were null in the function grid)
      if (functionGrid[r][c] === null && fn(r, c)) {
        result[r][c] = !val;
      } else {
        result[r][c] = val;
      }
    }
  }
  return result;
};

/**
 * Write format information (15 bits) into the matrix.
 */
const writeFormat = (
  matrix: QRMatrix,
  ecLevel: ECLevel,
  maskIdx: number
): void => {
  const size = matrix.length;
  const info = getFormatInfo(ecLevel, maskIdx);

  for (let i = 0; i < 15; i++) {
    const bit = ((info >> (14 - i)) & 1) === 1;

    // Copy 1: around top-left finder
    if (i < 6) matrix[8][i] = bit;
    else if (i === 6) matrix[8][7] = bit;
    else if (i === 7) matrix[8][8] = bit;
    else if (i === 8) matrix[7][8] = bit;
    else matrix[14 - i][8] = bit;

    // Copy 2: bottom-left (vertical) and top-right (horizontal)
    if (i < 8) matrix[size - 1 - i][8] = bit;
    else matrix[8][size - 15 + i] = bit;
  }

  // Dark module
  matrix[size - 8][8] = true;
};

/** Write version information (18 bits) for versions >= 7 */
const writeVersion = (matrix: QRMatrix, version: number): void => {
  if (version < 7) return;
  const size = matrix.length;
  const info = getVersionInfo(version);

  for (let i = 0; i < 18; i++) {
    const bit = ((info >> i) & 1) === 1;
    const r = Math.floor(i / 3);
    const c = i % 3;
    matrix[size - 11 + c][r] = bit;
    matrix[r][size - 11 + c] = bit;
  }
};

/** Calculate penalty score (ISO 18004 section 8.8) */
const penaltyScore = (matrix: QRMatrix): number => {
  const size = matrix.length;
  let score = 0;

  // Rule 1: runs of same color >= 5
  for (let r = 0; r < size; r++) {
    let rowRun = 1;
    let colRun = 1;
    for (let c = 1; c < size; c++) {
      rowRun = matrix[r][c] === matrix[r][c - 1] ? rowRun + 1 : 1;
      if (rowRun === 5) score += 3;
      else if (rowRun > 5) score += 1;

      colRun = matrix[c][r] === matrix[c - 1][r] ? colRun + 1 : 1;
      if (colRun === 5) score += 3;
      else if (colRun > 5) score += 1;
    }
  }

  // Rule 2: 2x2 blocks
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = matrix[r][c];
      if (
        v === matrix[r][c + 1] &&
        v === matrix[r + 1][c] &&
        v === matrix[r + 1][c + 1]
      )
        score += 3;
    }
  }

  // Rule 3: finder-like patterns
  const p1 = [
    true,
    false,
    true,
    true,
    true,
    false,
    true,
    false,
    false,
    false,
    false,
  ];
  const p2 = [
    false,
    false,
    false,
    false,
    true,
    false,
    true,
    true,
    true,
    false,
    true,
  ];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 11; c++) {
      let m1 = true,
        m2 = true,
        m3 = true,
        m4 = true;
      for (let i = 0; i < 11; i++) {
        if (matrix[r][c + i] !== p1[i]) m1 = false;
        if (matrix[r][c + i] !== p2[i]) m2 = false;
        if (matrix[c + i][r] !== p1[i]) m3 = false;
        if (matrix[c + i][r] !== p2[i]) m4 = false;
      }
      if (m1 || m2) score += 40;
      if (m3 || m4) score += 40;
    }
  }

  // Rule 4: dark module proportion
  let dark = 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) if (matrix[r][c]) dark++;
  const pct = (dark * 100) / (size * size);
  const prev5 = Math.floor(pct / 5) * 5;
  const next5 = prev5 + 5;
  score += Math.min(Math.abs(prev5 - 50) / 5, Math.abs(next5 - 50) / 5) * 10;

  return score;
};

/**
 * Build the complete QR matrix from interleaved codewords.
 * Uses a null-grid approach: null = data cell, non-null = function pattern.
 * This ensures masking is applied only to data modules.
 */
export const buildMatrix = (
  codewords: number[],
  version: number,
  ecLevel: ECLevel
): QRMatrix => {
  const size = getSize(version);

  // Phase 1: place all function patterns
  const grid = createGrid(size);

  placeFinder(grid, 0, 0, size);
  placeFinder(grid, 0, size - 7, size);
  placeFinder(grid, size - 7, 0, size);

  const positions = ALIGNMENT_POSITIONS[version - 1];
  for (const r of positions) {
    for (const c of positions) {
      if (!overlapsFinder(r, c, size)) placeAlignment(grid, r, c);
    }
  }

  placeTiming(grid, size);
  reserveFormatAreas(grid, size);
  reserveVersionAreas(grid, size, version);

  // Save function pattern grid (to know which cells are data vs function)
  const functionGrid = grid.map(row => [...row]);

  // Phase 2: place data bits (only into null cells)
  const bits: number[] = [];
  for (const cw of codewords) {
    for (let b = 7; b >= 0; b--) bits.push((cw >> b) & 1);
  }
  placeData(grid, bits);

  // Phase 3: try all 8 masks, pick lowest penalty
  let bestMask = 0;
  let bestScore = Infinity;
  let bestMatrix: QRMatrix | null = null;

  for (let m = 0; m < 8; m++) {
    const masked = applyMask(grid, functionGrid, m);
    writeFormat(masked, ecLevel, m);
    writeVersion(masked, version);
    const s = penaltyScore(masked);
    if (s < bestScore) {
      bestScore = s;
      bestMask = m;
      bestMatrix = masked;
    }
  }

  if (!bestMatrix) {
    bestMatrix = applyMask(grid, functionGrid, bestMask);
    writeFormat(bestMatrix, ecLevel, bestMask);
    writeVersion(bestMatrix, version);
  }

  return bestMatrix;
};
