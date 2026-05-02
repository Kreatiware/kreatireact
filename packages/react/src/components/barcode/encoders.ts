/**
 * Barcode encoding engines — Code128, EAN-13, EAN-8, UPC-A, Code39.
 *
 * Each encoder returns an array of bar widths: positive = black, negative = white.
 *
 * @internal
 */

/** Supported barcode formats */
export type BarcodeFormat = "code128" | "ean13" | "ean8" | "upca" | "code39";

/** Result of encoding: bar pattern + display text */
export interface BarcodeData {
  bars: number[];
  text: string;
}

/* ─── Code128 ────────────────────────────────────────────────────────── */

// prettier-ignore
const C128_PATTERNS: number[][] = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],
  [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
  [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],
  [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
  [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],
  [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
  [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],
  [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
  [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],
  [1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
  [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],
  [3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
  [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],
  [1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
  [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],
  [2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
  [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],
  [1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
  [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],
  [1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
  [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],
  [2,1,1,2,3,2],[2,3,3,1,1,1,2],
];

const C128_STOP = [2, 3, 3, 1, 1, 1, 2];

const patternToBars = (pattern: number[]): number[] => {
  const bars: number[] = [];
  for (let i = 0; i < pattern.length; i++) {
    bars.push(i % 2 === 0 ? pattern[i] : -pattern[i]);
  }
  return bars;
};

export const encodeCode128 = (data: string): BarcodeData => {
  // Auto-select start code: if all digits and even length, use C; else B
  const allDigits = /^\d+$/.test(data);
  const useC = allDigits && data.length % 2 === 0 && data.length >= 4;

  const values: number[] = [];
  let startCode: number;

  if (useC) {
    startCode = 105; // START C
    for (let i = 0; i < data.length; i += 2) {
      values.push(parseInt(data.substring(i, i + 2), 10));
    }
  } else {
    startCode = 104; // START B
    for (let i = 0; i < data.length; i++) {
      values.push(data.charCodeAt(i) - 32);
    }
  }

  // Checksum
  let checksum = startCode;
  for (let i = 0; i < values.length; i++) {
    checksum += values[i] * (i + 1);
  }
  checksum %= 103;

  // Build bars
  const bars: number[] = [
    ...patternToBars(C128_PATTERNS[startCode]),
    ...values.flatMap(v => patternToBars(C128_PATTERNS[v])),
    ...patternToBars(C128_PATTERNS[checksum]),
    ...patternToBars(C128_STOP),
  ];

  return { bars, text: data };
};

/* ─── EAN / UPC helpers ──────────────────────────────────────────────── */

// prettier-ignore
const EAN_L: number[][] = [
  [3,2,1,1],[2,2,2,1],[2,1,2,2],[1,4,1,1],[1,1,3,2],
  [1,2,3,1],[1,1,1,4],[1,3,1,2],[1,2,1,3],[3,1,1,2],
];
// prettier-ignore
const EAN_G: number[][] = [
  [1,1,2,3],[1,2,2,2],[2,2,1,2],[1,1,4,1],[2,3,1,1],
  [1,3,2,1],[4,1,1,1],[2,1,3,1],[3,1,2,1],[2,1,1,3],
];
// prettier-ignore
const EAN_R: number[][] = [
  [3,2,1,1],[2,2,2,1],[2,1,2,2],[1,4,1,1],[1,1,3,2],
  [1,2,3,1],[1,1,1,4],[1,3,1,2],[1,2,1,3],[3,1,1,2],
];

// EAN-13 first digit encoding pattern (which digits use L vs G)
// prettier-ignore
const EAN13_PARITY: number[][] = [
  [0,0,0,0,0,0],[0,0,1,0,1,1],[0,0,1,1,0,1],[0,0,1,1,1,0],
  [0,1,0,0,1,1],[0,1,1,0,0,1],[0,1,1,1,0,0],[0,1,0,1,0,1],
  [0,1,0,1,1,0],[0,1,1,0,1,0],
];

const GUARD_START = [1, -1, 1];
const GUARD_CENTER = [-1, 1, -1, 1, -1];
const GUARD_END = [1, -1, 1];

const eanDigitBars = (digit: number, encoding: "L" | "G" | "R"): number[] => {
  const table = encoding === "L" ? EAN_L : encoding === "G" ? EAN_G : EAN_R;
  const widths = table[digit];
  // L and G start with space (white), R starts with bar (black)
  const bars: number[] = [];
  for (let i = 0; i < widths.length; i++) {
    if (encoding === "R") {
      bars.push(i % 2 === 0 ? widths[i] : -widths[i]);
    } else {
      bars.push(i % 2 === 0 ? -widths[i] : widths[i]);
    }
  }
  return bars;
};

const computeEanCheckDigit = (digits: number[]): number => {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
};

/* ─── EAN-13 ─────────────────────────────────────────────────────────── */

export const encodeEAN13 = (data: string): BarcodeData => {
  const raw = data.replace(/\D/g, "");
  if (raw.length < 12 || raw.length > 13)
    throw new Error("EAN-13 requires 12 or 13 digits");

  const digits = raw.slice(0, 12).split("").map(Number);
  const check = computeEanCheckDigit(digits);
  if (raw.length === 13 && Number(raw[12]) !== check)
    throw new Error("EAN-13 checksum mismatch");
  digits.push(check);

  const parity = EAN13_PARITY[digits[0]];
  const bars: number[] = [...GUARD_START];

  // Left 6 digits (digits[1]-digits[6])
  for (let i = 0; i < 6; i++) {
    bars.push(...eanDigitBars(digits[i + 1], parity[i] === 0 ? "L" : "G"));
  }
  bars.push(...GUARD_CENTER);
  // Right 6 digits (digits[7]-digits[12])
  for (let i = 7; i <= 12; i++) {
    bars.push(...eanDigitBars(digits[i], "R"));
  }
  bars.push(...GUARD_END);

  return { bars, text: digits.join("") };
};

/* ─── EAN-8 ──────────────────────────────────────────────────────────── */

export const encodeEAN8 = (data: string): BarcodeData => {
  const raw = data.replace(/\D/g, "");
  if (raw.length < 7 || raw.length > 8)
    throw new Error("EAN-8 requires 7 or 8 digits");

  const digits = raw.slice(0, 7).split("").map(Number);
  const check = computeEanCheckDigit(digits);
  if (raw.length === 8 && Number(raw[7]) !== check)
    throw new Error("EAN-8 checksum mismatch");
  digits.push(check);

  const bars: number[] = [...GUARD_START];
  for (let i = 0; i < 4; i++) bars.push(...eanDigitBars(digits[i], "L"));
  bars.push(...GUARD_CENTER);
  for (let i = 4; i < 8; i++) bars.push(...eanDigitBars(digits[i], "R"));
  bars.push(...GUARD_END);

  return { bars, text: digits.join("") };
};

/* ─── UPC-A ──────────────────────────────────────────────────────────── */

export const encodeUPCA = (data: string): BarcodeData => {
  const raw = data.replace(/\D/g, "");
  if (raw.length < 11 || raw.length > 12)
    throw new Error("UPC-A requires 11 or 12 digits");

  const digits = raw.slice(0, 11).split("").map(Number);
  const check = computeEanCheckDigit(digits);
  if (raw.length === 12 && Number(raw[11]) !== check)
    throw new Error("UPC-A checksum mismatch");
  digits.push(check);

  const bars: number[] = [...GUARD_START];
  for (let i = 0; i < 6; i++) bars.push(...eanDigitBars(digits[i], "L"));
  bars.push(...GUARD_CENTER);
  for (let i = 6; i < 12; i++) bars.push(...eanDigitBars(digits[i], "R"));
  bars.push(...GUARD_END);

  return { bars, text: digits.join("") };
};

/* ─── Code39 ─────────────────────────────────────────────────────────── */

const C39_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%*";

/**
 * Code39 patterns from ISO 16388.
 * Each string is 9 chars: n=narrow(1), W=wide(3), alternating bar/space/bar/space...
 * Every character has exactly 3 wide and 6 narrow elements.
 */
// prettier-ignore
const C39_RAW: Record<string, string> = {
  '0': 'nnnWWnWnn', '1': 'WnnWnnnnW', '2': 'nnWWnnnnW', '3': 'WnWWnnnnn',
  '4': 'nnnWWnnnW', '5': 'WnnWWnnnn', '6': 'nnWWWnnnn', '7': 'nnnWnnWnW',
  '8': 'WnnWnnWnn', '9': 'nnWWnnWnn', 'A': 'WnnnnWnnW', 'B': 'nnWnnWnnW',
  'C': 'WnWnnWnnn', 'D': 'nnnnWWnnW', 'E': 'WnnnWWnnn', 'F': 'nnWnWWnnn',
  'G': 'nnnnnWWnW', 'H': 'WnnnnWWnn', 'I': 'nnWnnWWnn', 'J': 'nnnnWWWnn',
  'K': 'WnnnnnnWW', 'L': 'nnWnnnnWW', 'M': 'WnWnnnnWn', 'N': 'nnnnWnnWW',
  'O': 'WnnnWnnWn', 'P': 'nnWnWnnWn', 'Q': 'nnnnnnWWW', 'R': 'WnnnnnWWn',
  'S': 'nnWnnnWWn', 'T': 'nnnnWnWWn', 'U': 'WWnnnnnnW', 'V': 'nWWnnnnnW',
  'W': 'WWWnnnnnn', 'X': 'nWnnWnnnW', 'Y': 'WWnnWnnnn', 'Z': 'nWWnWnnnn',
  '-': 'nWnnnnWnW', '.': 'WWnnnnWnn', ' ': 'nWWnnnWnn', '$': 'nWnWnWnnn',
  '/': 'nWnWnnnWn', '+': 'nWnnnWnWn', '%': 'nnnWnWnWn', '*': 'nWnnWnWnn',
};

const parseC39 = (s: string): number[] =>
  s.split("").map(c => (c === "W" ? 2 : 1));

export const encodeCode39 = (data: string): BarcodeData => {
  const upper = data.toUpperCase();
  const bars: number[] = [];

  const addChar = (pattern: string) => {
    const widths = parseC39(pattern);
    for (let i = 0; i < 9; i++) {
      bars.push(i % 2 === 0 ? widths[i] : -widths[i]);
    }
    bars.push(-1); // inter-character gap
  };

  addChar(C39_RAW["*"]);
  for (const ch of upper) {
    if (ch === "*" || !C39_RAW[ch])
      throw new Error(`Code39: invalid character '${ch}'`);
    addChar(C39_RAW[ch]);
  }
  addChar(C39_RAW["*"]);

  bars.pop(); // remove trailing gap
  return { bars, text: upper };
};

/* ─── Dispatcher ─────────────────────────────────────────────────────── */

export const encodeBarcode = (
  data: string,
  format: BarcodeFormat
): BarcodeData => {
  switch (format) {
    case "code128":
      return encodeCode128(data);
    case "ean13":
      return encodeEAN13(data);
    case "ean8":
      return encodeEAN8(data);
    case "upca":
      return encodeUPCA(data);
    case "code39":
      return encodeCode39(data);
  }
};
