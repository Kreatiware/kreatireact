/**
 * Reed-Solomon error correction for QR Code using GF(256).
 *
 * @internal
 */

import {
  type ECLevel,
  EC_INDEX,
  EC_BLOCKS,
  EC_CODEWORDS_PER_BLOCK,
  GF_EXP,
  GF_LOG,
} from "./tables";

/** Multiply two values in GF(256) */
const gfMul = (a: number, b: number): number => {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
};

/**
 * Generate a Reed-Solomon generator polynomial of the given degree.
 * Returns coefficients in descending order.
 */
const generatorPoly = (degree: number): number[] => {
  let gen = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(gen.length + 1).fill(0);
    const factor = GF_EXP[i];
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j];
      next[j + 1] ^= gfMul(gen[j], factor);
    }
    gen = next;
  }
  return gen;
};

/**
 * Compute Reed-Solomon error correction codewords for a data block.
 */
const rsEncode = (data: number[], ecCount: number): number[] => {
  const gen = generatorPoly(ecCount);
  const result = new Array(ecCount).fill(0);

  for (const byte of data) {
    const coeff = byte ^ result[0];
    result.shift();
    result.push(0);
    if (coeff !== 0) {
      for (let i = 0; i < ecCount; i++) {
        result[i] ^= gfMul(gen[i + 1], coeff);
      }
    }
  }
  return result;
};

/**
 * Split data codewords into blocks, compute EC for each block,
 * and interleave into the final codeword sequence.
 */
export const computeEC = (
  dataCodewords: number[],
  version: number,
  ecLevel: ECLevel
): number[] => {
  const ecIdx = EC_INDEX[ecLevel];
  const ecPerBlock = EC_CODEWORDS_PER_BLOCK[version - 1][ecIdx];
  const [g1Count, g1Data, g2Count, g2Data] = EC_BLOCKS[version - 1][ecIdx];

  // Build blocks
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;

  // Group 1
  for (let i = 0; i < g1Count; i++) {
    const block = dataCodewords.slice(offset, offset + g1Data);
    offset += g1Data;
    dataBlocks.push(block);
    ecBlocks.push(rsEncode(block, ecPerBlock));
  }

  // Group 2
  for (let i = 0; i < g2Count; i++) {
    const block = dataCodewords.slice(offset, offset + g2Data);
    offset += g2Data;
    dataBlocks.push(block);
    ecBlocks.push(rsEncode(block, ecPerBlock));
  }

  // Interleave data codewords
  const result: number[] = [];
  const maxDataLen = Math.max(...dataBlocks.map(b => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  // Interleave EC codewords
  for (let i = 0; i < ecPerBlock; i++) {
    for (const block of ecBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  return result;
};
