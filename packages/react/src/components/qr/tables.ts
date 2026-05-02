/**
 * QR Code lookup tables — capacity, error correction, alignment patterns,
 * format/version info, and generator polynomials.
 *
 * @internal
 */

/** Error correction levels */
export type ECLevel = "L" | "M" | "Q" | "H";

/** Encoding modes */
export type Mode = "numeric" | "alphanumeric" | "byte";

/** Number of modules per side = 17 + version * 4 */
export const getSize = (version: number): number => 17 + version * 4;

/**
 * Character count indicator bit lengths per mode per version range.
 * Index 0 = versions 1-9, 1 = 10-26, 2 = 27-40.
 */
export const CHAR_COUNT_BITS: Record<Mode, [number, number, number]> = {
  numeric: [10, 12, 14],
  alphanumeric: [9, 11, 13],
  byte: [8, 16, 16],
};

/** Mode indicators (4-bit) */
export const MODE_INDICATOR: Record<Mode, number> = {
  numeric: 0b0001,
  alphanumeric: 0b0010,
  byte: 0b0100,
};

/** Alphanumeric character set for encoding */
const ALPHANUM_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

/** Returns the alphanumeric index of a character, or -1 if not in the set */
export const alphanumericIndex = (ch: string): number =>
  ALPHANUM_CHARS.indexOf(ch);

/** EC level to index mapping */
export const EC_INDEX: Record<ECLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };

/**
 * Total codewords per version (data + EC).
 * Version 1 = 26, Version 2 = 44, etc.
 */
// prettier-ignore
export const TOTAL_CODEWORDS: number[] = [
  26,44,70,100,134,172,196,242,292,346,
  404,466,532,581,655,733,815,901,991,1085,
  1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,
  2323,2465,2611,2761,2876,3034,3196,3362,3532,3706,
];

/**
 * Number of EC codewords per block for [version][ecLevel].
 */
// prettier-ignore
export const EC_CODEWORDS_PER_BLOCK: number[][] = [
  [7,10,13,17],[10,16,22,28],[15,26,18,22],[20,18,26,16],
  [26,24,18,22],[18,16,24,28],[20,18,18,26],[24,22,22,26],
  [30,22,20,24],[18,26,24,28],[20,30,28,24],[24,22,26,28],
  [26,22,24,22],[30,24,20,24],[22,24,30,24],[24,28,24,30],
  [28,28,28,28],[30,26,28,28],[28,26,26,26],[28,26,28,28],
  [28,26,30,28],[28,28,24,30],[30,28,30,30],[30,28,30,30],
  [26,28,30,30],[28,28,28,30],[30,28,30,30],[30,28,30,30],
  [30,28,30,30],[30,28,30,30],[30,28,30,30],[30,28,30,30],
  [30,28,30,30],[30,28,30,30],[30,28,30,30],[30,28,30,30],
  [30,28,30,30],[30,28,30,30],[30,28,30,30],[30,28,30,30],
];

/**
 * Number of EC blocks for [version][ecLevel].
 * Each entry is [numBlocks_group1, dataCodewords_group1, numBlocks_group2, dataCodewords_group2].
 * Group 2 may have 0 blocks.
 */
// prettier-ignore
export const EC_BLOCKS: [number, number, number, number][][] = [
  /*  1 */ [[1,19,0,0],[1,16,0,0],[1,13,0,0],[1,9,0,0]],
  /*  2 */ [[1,34,0,0],[1,28,0,0],[1,22,0,0],[1,16,0,0]],
  /*  3 */ [[1,55,0,0],[1,44,0,0],[2,17,0,0],[2,13,0,0]],
  /*  4 */ [[1,80,0,0],[2,32,0,0],[2,24,0,0],[4,9,0,0]],
  /*  5 */ [[1,108,0,0],[2,43,0,0],[2,15,2,16],[2,11,2,12]],
  /*  6 */ [[2,68,0,0],[4,27,0,0],[4,19,0,0],[4,15,0,0]],
  /*  7 */ [[2,78,0,0],[4,31,0,0],[2,14,4,15],[4,13,1,14]],
  /*  8 */ [[2,97,0,0],[2,38,2,39],[4,18,2,19],[4,14,2,15]],
  /*  9 */ [[2,116,0,0],[3,36,2,37],[4,16,4,17],[4,12,4,13]],
  /* 10 */ [[2,68,2,69],[4,43,1,44],[6,19,2,20],[6,15,2,16]],
  /* 11 */ [[4,81,0,0],[1,50,4,51],[4,22,4,23],[3,12,8,13]],
  /* 12 */ [[2,92,2,93],[6,36,2,37],[4,20,6,21],[7,14,4,15]],
  /* 13 */ [[4,107,0,0],[8,37,1,38],[8,20,4,21],[12,11,4,12]],
  /* 14 */ [[3,115,1,116],[4,40,5,41],[11,16,5,17],[11,12,5,13]],
  /* 15 */ [[5,87,1,88],[5,41,5,42],[5,24,7,25],[11,12,7,13]],
  /* 16 */ [[5,98,1,99],[7,45,3,46],[15,19,2,20],[3,15,13,16]],
  /* 17 */ [[1,107,5,108],[10,46,1,47],[1,22,15,23],[2,14,17,15]],
  /* 18 */ [[5,120,1,121],[9,43,4,44],[17,22,1,23],[2,14,19,15]],
  /* 19 */ [[3,113,4,114],[3,44,11,45],[17,21,4,22],[9,13,16,14]],
  /* 20 */ [[3,107,5,108],[3,41,13,42],[15,24,5,25],[15,15,10,16]],
  /* 21 */ [[4,116,4,117],[17,42,0,0],[17,22,6,23],[19,16,6,17]],
  /* 22 */ [[2,111,7,112],[17,46,0,0],[7,24,16,25],[34,13,0,0]],
  /* 23 */ [[4,121,5,122],[4,47,14,48],[11,24,14,25],[16,15,14,16]],
  /* 24 */ [[6,117,4,118],[6,45,14,46],[11,24,16,25],[30,16,2,17]],
  /* 25 */ [[8,106,4,107],[8,47,13,48],[7,24,22,25],[22,15,13,16]],
  /* 26 */ [[10,114,2,115],[19,46,4,47],[28,22,6,23],[33,16,4,17]],
  /* 27 */ [[8,122,4,123],[22,45,3,46],[8,23,26,24],[12,15,28,16]],
  /* 28 */ [[3,117,10,118],[3,45,23,46],[4,24,31,25],[11,15,31,16]],
  /* 29 */ [[7,116,7,117],[21,45,7,46],[1,23,37,24],[19,15,26,16]],
  /* 30 */ [[5,115,10,116],[19,47,10,48],[15,24,25,25],[23,15,25,16]],
  /* 31 */ [[13,115,3,116],[2,46,29,47],[42,24,1,25],[23,15,28,16]],
  /* 32 */ [[17,115,0,0],[10,46,23,47],[10,24,35,25],[19,15,35,16]],
  /* 33 */ [[17,115,1,116],[14,46,21,47],[29,24,19,25],[11,15,46,16]],
  /* 34 */ [[13,115,6,116],[14,46,23,47],[44,24,7,25],[59,16,1,17]],
  /* 35 */ [[12,121,7,122],[12,47,26,48],[39,24,14,25],[22,15,41,16]],
  /* 36 */ [[6,121,14,122],[6,47,34,48],[46,24,10,25],[2,15,64,16]],
  /* 37 */ [[17,122,4,123],[29,46,14,47],[49,24,10,25],[24,15,46,16]],
  /* 38 */ [[4,122,18,123],[13,46,32,47],[48,24,14,25],[42,15,32,16]],
  /* 39 */ [[20,117,4,118],[40,47,7,48],[43,24,22,25],[10,15,67,16]],
  /* 40 */ [[19,118,6,119],[18,47,31,48],[34,24,34,25],[20,15,61,16]],
];

/**
 * Alignment pattern center coordinates per version.
 * Version 1 has no alignment patterns.
 */
// prettier-ignore
export const ALIGNMENT_POSITIONS: number[][] = [
  [],
  [6,18],[6,22],[6,26],[6,30],[6,34],
  [6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],
  [6,32,58],[6,34,62],
  [6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],
  [6,30,56,82],[6,30,58,86],[6,34,62,90],
  [6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],
  [6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],
  [6,34,62,90,118],
  [6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],
  [6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],
  [6,34,62,90,118,146],
  [6,30,54,78,102,126,150],[6,24,50,76,102,128,154],
  [6,28,54,80,106,132,158],[6,32,58,84,110,136,162],
  [6,26,54,82,110,138,166],[6,30,58,86,114,142,170],
];

/**
 * Format information lookup.
 * Computed from (ecLevel << 3 | mask) with BCH(15,5) encoding and XOR mask 0x5412.
 */
const computeFormatInfo = (ecBits: number, mask: number): number => {
  const data = (ecBits << 3) | mask;
  let bits = data << 10;
  // BCH division by generator polynomial x^10 + x^8 + x^5 + x^4 + x^2 + x + 1 = 0x537
  for (let i = 4; i >= 0; i--) {
    if (bits & (1 << (i + 10))) bits ^= 0x537 << i;
  }
  return ((data << 10) | bits) ^ 0x5412;
};

/** EC level bits for format info: L=01, M=00, Q=11, H=10 */
const EC_FORMAT_BITS: Record<ECLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

/** Get the 15-bit format info for a given EC level and mask */
export const getFormatInfo = (ecLevel: ECLevel, mask: number): number =>
  computeFormatInfo(EC_FORMAT_BITS[ecLevel], mask);

/**
 * Version information (18-bit) computed with BCH(18,6).
 * For versions 7-40.
 */
export const getVersionInfo = (version: number): number => {
  if (version < 7) return 0;
  let bits = version << 12;
  // BCH division by generator polynomial x^12 + x^11 + x^10 + x^9 + x^8 + x^5 + x^2 + 1 = 0x1f25
  for (let i = 5; i >= 0; i--) {
    if (bits & (1 << (i + 12))) bits ^= 0x1f25 << i;
  }
  return (version << 12) | bits;
};

/** Log and antilog tables for GF(256) with primitive polynomial 0x11d */
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x >= 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

export { GF_EXP, GF_LOG };
