/**
 * QR Code data encoding — mode analysis, bit stream generation.
 *
 * @internal
 */

import {
  type ECLevel,
  type Mode,
  CHAR_COUNT_BITS,
  MODE_INDICATOR,
  EC_INDEX,
  EC_BLOCKS,
  EC_CODEWORDS_PER_BLOCK,
  TOTAL_CODEWORDS,
  alphanumericIndex,
} from "./tables";

/** Detect the best encoding mode for the given data */
export const detectMode = (data: string): Mode => {
  if (/^\d+$/.test(data)) return "numeric";
  if (/^[0-9A-Z $%*+\-./:]+$/.test(data)) return "alphanumeric";
  return "byte";
};

/** Get the character count indicator bit length for a version */
const charCountBits = (mode: Mode, version: number): number => {
  const idx = version <= 9 ? 0 : version <= 26 ? 1 : 2;
  return CHAR_COUNT_BITS[mode][idx];
};

/** Push N bits of value into the bit array (MSB first) */
const pushBits = (bits: number[], value: number, count: number): void => {
  for (let i = count - 1; i >= 0; i--) bits.push((value >> i) & 1);
};

/** Encode numeric data into bits */
const encodeNumeric = (data: string, bits: number[]): void => {
  for (let i = 0; i < data.length; i += 3) {
    const chunk = data.substring(i, i + 3);
    const val = parseInt(chunk, 10);
    const len = chunk.length === 3 ? 10 : chunk.length === 2 ? 7 : 4;
    pushBits(bits, val, len);
  }
};

/** Encode alphanumeric data into bits */
const encodeAlphanumeric = (data: string, bits: number[]): void => {
  for (let i = 0; i < data.length; i += 2) {
    if (i + 1 < data.length) {
      const val =
        alphanumericIndex(data[i]) * 45 + alphanumericIndex(data[i + 1]);
      pushBits(bits, val, 11);
    } else {
      pushBits(bits, alphanumericIndex(data[i]), 6);
    }
  }
};

/** Encode byte data (UTF-8) into bits */
const encodeByte = (data: string, bits: number[]): void => {
  const bytes = new TextEncoder().encode(data);
  for (const byte of bytes) pushBits(bits, byte, 8);
};

/** Get total data codewords for a version + EC level */
const getDataCodewords = (version: number, ecLevel: ECLevel): number => {
  const ecIdx = EC_INDEX[ecLevel];
  const total = TOTAL_CODEWORDS[version - 1];
  const ecPerBlock = EC_CODEWORDS_PER_BLOCK[version - 1][ecIdx];
  const [g1Count, , g2Count] = EC_BLOCKS[version - 1][ecIdx];
  const totalBlocks = g1Count + g2Count;
  return total - totalBlocks * ecPerBlock;
};

/**
 * Determine the minimum QR version that can hold the data
 * at the given error correction level.
 */
export const getMinVersion = (
  data: string,
  mode: Mode,
  ecLevel: ECLevel
): number => {
  const byteLen =
    mode === "byte" ? new TextEncoder().encode(data).length : data.length;

  for (let v = 1; v <= 40; v++) {
    const capacity = getDataCodewords(v, ecLevel);
    const ccBits = charCountBits(mode, v);
    const headerBits = 4 + ccBits;

    let dataBits: number;
    if (mode === "numeric") {
      const groups = Math.floor(byteLen / 3);
      const rem = byteLen % 3;
      dataBits = groups * 10 + (rem === 2 ? 7 : rem === 1 ? 4 : 0);
    } else if (mode === "alphanumeric") {
      dataBits = Math.floor(byteLen / 2) * 11 + (byteLen % 2) * 6;
    } else {
      dataBits = byteLen * 8;
    }

    const totalBits = headerBits + dataBits;
    if (totalBits <= capacity * 8) return v;
  }
  throw new Error("Data too long for QR Code (max version 40)");
};

/**
 * Encode data into a complete bit stream with mode indicator,
 * character count, data, terminator, and padding.
 * Returns an array of data codewords (bytes).
 */
export const encodeData = (
  data: string,
  mode: Mode,
  version: number,
  ecLevel: ECLevel
): number[] => {
  const totalDataCodewords = getDataCodewords(version, ecLevel);
  const totalBits = totalDataCodewords * 8;

  const bits: number[] = [];

  // Mode indicator (4 bits)
  pushBits(bits, MODE_INDICATOR[mode], 4);

  // Character count
  const byteLen =
    mode === "byte" ? new TextEncoder().encode(data).length : data.length;
  pushBits(bits, byteLen, charCountBits(mode, version));

  // Data bits
  if (mode === "numeric") encodeNumeric(data, bits);
  else if (mode === "alphanumeric") encodeAlphanumeric(data, bits);
  else encodeByte(data, bits);

  // Terminator (up to 4 zero bits)
  const termLen = Math.min(4, totalBits - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(0);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad codewords (alternating 0xEC, 0x11)
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < totalBits) {
    pushBits(bits, padBytes[padIdx], 8);
    padIdx = (padIdx + 1) % 2;
  }

  // Convert bits to bytes
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | (bits[i + b] || 0);
    codewords.push(byte);
  }

  return codewords;
};
