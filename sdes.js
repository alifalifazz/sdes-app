/* =========================================================
   S-DES (Simplified Data Encryption Standard) - Core Logic
   ========================================================= */

// ---------- Tabel Permutasi & S-Box ----------
const P10 = [3, 5, 2, 7, 4, 10, 1, 9, 8, 6];
const P8  = [6, 3, 7, 4, 8, 5, 10, 9];
const IP  = [2, 6, 3, 1, 4, 8, 5, 7];
const IP_INV = [4, 1, 3, 5, 7, 2, 8, 6];
const EP  = [4, 1, 2, 3, 2, 3, 4, 1];
const P4  = [2, 4, 3, 1];

const S0 = [
  [1, 0, 3, 2],
  [3, 2, 1, 0],
  [0, 2, 1, 3],
  [3, 1, 3, 2]
];

const S1 = [
  [0, 1, 2, 3],
  [2, 0, 1, 3],
  [3, 0, 1, 0],
  [2, 1, 0, 3]
];

// ---------- Helper ----------
function toBitArray(str) {
  return str.split("").map(Number);
}

function permute(bits, table) {
  // table berisi posisi 1-based
  return table.map(pos => bits[pos - 1]);
}

function leftShift(bits, n) {
  return bits.slice(n).concat(bits.slice(0, n));
}

function xorBits(a, b) {
  return a.map((bit, i) => bit ^ b[i]);
}

function toStr(bits) {
  return bits.join("");
}

function decToBin2(num) {
  return num.toString(2).padStart(2, "0").split("").map(Number);
}

// ---------- Key Generation ----------
function generateKeys(key10) {
  const keyBits = toBitArray(key10);

  const p10Result = permute(keyBits, P10);
  const left0 = p10Result.slice(0, 5);
  const right0 = p10Result.slice(5, 10);

  const left1 = leftShift(left0, 1);
  const right1 = leftShift(right0, 1);
  const combined1 = left1.concat(right1);
  const k1 = permute(combined1, P8);

  const left2 = leftShift(left1, 2);
  const right2 = leftShift(right1, 2);
  const combined2 = left2.concat(right2);
  const k2 = permute(combined2, P8);

  return {
    k1: toStr(k1),
    k2: toStr(k2),
    steps: {
      keyInput: key10,
      p10Result: toStr(p10Result),
      left0: toStr(left0),
      right0: toStr(right0),
      left1: toStr(left1),
      right1: toStr(right1),
      combined1: toStr(combined1),
      k1: toStr(k1),
      left2: toStr(left2),
      right2: toStr(right2),
      combined2: toStr(combined2),
      k2: toStr(k2)
    }
  };
}

// ---------- S-Box Lookup ----------
function sBoxLookup(bits4, sbox) {
  // bits4 = [b1,b2,b3,b4]
  // baris = (b1,b4) ; kolom = (b2,b3)
  const row = parseInt(`${bits4[0]}${bits4[3]}`, 2);
  const col = parseInt(`${bits4[1]}${bits4[2]}`, 2);
  const value = sbox[row][col];
  return {
    row, col, value,
    bits: decToBin2(value)
  };
}

// ---------- Round Function ----------
function roundFunction(left4, right4, subkey8) {
  const rightBits = toBitArray(right4);
  const leftBits = toBitArray(left4);
  const subkeyBits = toBitArray(subkey8);

  // 1. Expansion Permutation
  const epResult = permute(rightBits, EP);

  // 2. XOR dengan subkey
  const xorResult = xorBits(epResult, subkeyBits);

  // 3. Split jadi 2 bagian 4-bit
  const s0Input = xorResult.slice(0, 4);
  const s1Input = xorResult.slice(4, 8);

  // 4. S-Box
  const s0Out = sBoxLookup(s0Input, S0);
  const s1Out = sBoxLookup(s1Input, S1);

  const sboxCombined = s0Out.bits.concat(s1Out.bits);

  // 5. Permutasi P4
  const p4Result = permute(sboxCombined, P4);

  // 6. XOR dengan left4
  const newLeft = xorBits(p4Result, leftBits);

  return {
    newLeft: toStr(newLeft),
    newRight: right4, // tidak berubah dalam round function (sebelum swap)
    steps: {
      input_left: left4,
      input_right: right4,
      subkey: subkey8,
      epResult: toStr(epResult),
      xorResult: toStr(xorResult),
      s0Input: toStr(s0Input),
      s1Input: toStr(s1Input),
      s0: s0Out,
      s1: s1Out,
      sboxCombined: toStr(sboxCombined),
      p4Result: toStr(p4Result),
      newLeft: toStr(newLeft)
    }
  };
}

// ---------- Proses Utama (Enkripsi / Dekripsi) ----------
function processSDES(input8, key10, mode) {
  const { k1, k2, steps: keySteps } = generateKeys(key10);

  // Tentukan urutan subkey berdasarkan mode
  const subkeyRound1 = (mode === "encrypt") ? k1 : k2;
  const subkeyRound2 = (mode === "encrypt") ? k2 : k1;

  const inputBits = toBitArray(input8);

  // Initial Permutation
  const ipResult = permute(inputBits, IP);
  const ipStr = toStr(ipResult);
  const L0 = ipStr.slice(0, 4);
  const R0 = ipStr.slice(4, 8);

  // Round 1
  const round1 = roundFunction(L0, R0, subkeyRound1);
  // Swap
  const L1 = round1.newRight; // setelah swap: kiri = R lama, kanan = L baru
  const R1 = round1.newLeft;

  // Round 2 (tanpa swap setelah ini)
  const round2 = roundFunction(L1, R1, subkeyRound2);
  const L2 = round2.newLeft;
  const R2 = round2.newRight;

  const preIPInv = L2 + R2;
  const ipInvResult = permute(toBitArray(preIPInv), IP_INV);
  const output = toStr(ipInvResult);

  return {
    output,
    k1, k2,
    steps: {
      keyGeneration: keySteps,
      input: input8,
      mode,
      subkeyRound1,
      subkeyRound2,
      ip: {
        result: ipStr,
        L0, R0
      },
      round1: {
        ...round1.steps,
        afterSwap_L: L1,
        afterSwap_R: R1,
        combinedBeforeSwap: round1.newLeft + round1.newRight,
        combinedAfterSwap: L1 + R1
      },
      round2: {
        ...round2.steps,
        L2, R2,
        combined: L2 + R2
      },
      ipInverse: {
        input: preIPInv,
        result: output
      },
      output
    }
  };
}

// Export untuk digunakan di app.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { generateKeys, processSDES, P10, P8, IP, IP_INV, EP, P4, S0, S1 };
}
