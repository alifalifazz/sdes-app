/* =========================================================
   S-DES Simulator — UI Logic
   ========================================================= */

// ---------- Helper render ----------

/**
 * Render deretan bit menjadi kotak/cell bernomor.
 * @param {string} bits - string biner, mis. "11001110"
 * @param {string} variant - kelas tambahan, mis. "bitgrid--accent"
 */
function renderBitGrid(bits, variant = "") {
  const cells = bits
    .split("")
    .map((bit, i) => `
      <div class="bitcell">
        <div class="bitcell__value">${bit}</div>
        <div class="bitcell__index">${i + 1}</div>
      </div>
    `)
    .join("");
  return `<div class="bitgrid ${variant}">${cells}</div>`;
}

/**
 * Render satu blok langkah perhitungan.
 * @param {string} label - judul langkah
 * @param {string} desc - deskripsi singkat
 * @param {Array} rows - [{label: string, bits: string, variant?: string, raw?: string}]
 */
function renderStep(label, desc, rows) {
  const rowsHtml = rows
    .map(row => {
      if (row.raw) {
        return `<div class="step__row">${row.raw}</div>`;
      }
      return `
        <div class="step__row">
          <span class="step__row-label">${row.label}</span>
          ${renderBitGrid(row.bits, row.variant || "")}
        </div>
      `;
    })
    .join("");

  return `
    <div class="step__label">${label}</div>
    <div class="step__desc">${desc}</div>
    ${rowsHtml}
  `;
}

function renderSBoxTable(sboxData, sboxValues, name) {
  let rows = "";
  for (let r = 0; r < 4; r++) {
    let cells = "";
    for (let c = 0; c < 4; c++) {
      const isActive = (r === sboxData.row && c === sboxData.col);
      cells += `<td class="${isActive ? "active" : ""}">${sboxValues[r][c].toString(2).padStart(2, "0")}</td>`;
    }
    rows += `<tr><th>${r.toString(2).padStart(2, "0")}</th>${cells}</tr>`;
  }
  return `
    <table class="step__sbox-table">
      <caption style="caption-side:top; text-align:left; color:var(--text-muted); font-size:0.72rem; padding-bottom:6px;">
        Tabel ${name} &mdash; baris (b1b4) = ${sboxData.row.toString(2).padStart(2, "0")}, kolom (b2b3) = ${sboxData.col.toString(2).padStart(2, "0")}
      </caption>
      <tr><th>${name}</th><th>00</th><th>01</th><th>10</th><th>11</th></tr>
      ${rows}
    </table>
  `;
}

// ---------- Validasi ----------
function isValidBits(str, len) {
  return new RegExp(`^[01]{${len}}$`).test(str);
}

// ---------- Render seluruh solusi ----------
function renderSolution(result) {
  const { keyGeneration: kg, ip, round1: r1, round2: r2, ipInverse, mode } = result.steps;

  // --- A. Key Generation ---
  document.getElementById("kg-step-input").innerHTML = renderStep(
    "Kunci Awal (10-bit)",
    "Kunci yang dimasukkan pengguna sebelum diproses.",
    [{ label: "Key", bits: kg.keyInput }]
  );

  document.getElementById("kg-step-p10").innerHTML = renderStep(
    "Permutasi P10",
    "Susunan ulang 10-bit kunci sesuai tabel P10 = [3,5,2,7,4,10,1,9,8,6].",
    [{ label: "Hasil P10", bits: kg.p10Result, variant: "bitgrid--accent" }]
  );

  document.getElementById("kg-step-split0").innerHTML = renderStep(
    "Pembagian Hasil P10",
    "Hasil P10 dibagi menjadi 5 bit kiri (L0) dan 5 bit kanan (R0).",
    [
      { label: "Bagian Kiri (L0)", bits: kg.left0 },
      { label: "Bagian Kanan (R0)", bits: kg.right0 }
    ]
  );

  document.getElementById("kg-step-ls1").innerHTML = renderStep(
    "Left Shift 1 (LS-1)",
    "Setiap bagian (L0 dan R0) digeser ke kiri sebanyak 1 posisi.",
    [
      { label: "L0 → LS-1", bits: kg.left1, variant: "bitgrid--accent" },
      { label: "R0 → LS-1", bits: kg.right1, variant: "bitgrid--accent" }
    ]
  );

  document.getElementById("kg-step-p8-k1").innerHTML = renderStep(
    "Permutasi P8 → K1",
    "Gabungan hasil LS-1 (10 bit) dipermutasi dengan tabel P8 = [6,3,7,4,8,5,10,9] untuk menghasilkan K1.",
    [
      { label: "Gabungan LS-1", bits: kg.combined1 },
      { label: "K1 (Sub-key Ronde 1)", bits: kg.k1, variant: "bitgrid--amber" }
    ]
  );

  document.getElementById("kg-step-ls2").innerHTML = renderStep(
    "Left Shift 2 (LS-2)",
    "Dari hasil LS-1, masing-masing bagian digeser ke kiri sebanyak 2 posisi.",
    [
      { label: "L1 → LS-2", bits: kg.left2, variant: "bitgrid--accent" },
      { label: "R1 → LS-2", bits: kg.right2, variant: "bitgrid--accent" }
    ]
  );

  document.getElementById("kg-step-p8-k2").innerHTML = renderStep(
    "Permutasi P8 → K2",
    "Gabungan hasil LS-2 (10 bit) dipermutasi dengan tabel P8 untuk menghasilkan K2.",
    [
      { label: "Gabungan LS-2", bits: kg.combined2 },
      { label: "K2 (Sub-key Ronde 2)", bits: kg.k2, variant: "bitgrid--amber" }
    ]
  );

  // --- B. Initial Permutation ---
  document.getElementById("ip-step-input").innerHTML = renderStep(
    "Input 8-bit",
    `Nilai ${mode === "encrypt" ? "plaintext" : "ciphertext"} yang akan diproses.`,
    [{ label: "Input", bits: result.steps.input }]
  );

  document.getElementById("ip-step-result").innerHTML = renderStep(
    "Initial Permutation (IP)",
    "Susunan ulang 8-bit input sesuai tabel IP = [2,6,3,1,4,8,5,7].",
    [{ label: "Hasil IP", bits: ip.result, variant: "bitgrid--accent" }]
  );

  document.getElementById("ip-step-split").innerHTML = renderStep(
    "Pembagian Hasil IP",
    "Hasil IP dibagi menjadi 4-bit kiri (L) dan 4-bit kanan (R).",
    [
      { label: "Kiri (L0)", bits: ip.L0 },
      { label: "Kanan (R0)", bits: ip.R0 }
    ]
  );

  // --- C. Round 1 ---
  const subkey1Label = mode === "encrypt" ? "K1" : "K2";
  const subkey2Label = mode === "encrypt" ? "K2" : "K1";

  document.getElementById("r1-step-ep").innerHTML = renderStep(
    "Expansion Permutation (EP)",
    `Bagian kanan 4-bit (R0) diperluas menjadi 8-bit menggunakan tabel EP = [4,1,2,3,2,3,4,1].`,
    [
      { label: "R0 (4-bit)", bits: r1.input_right },
      { label: "Hasil EP (8-bit)", bits: r1.epResult, variant: "bitgrid--accent" }
    ]
  );

  document.getElementById("r1-step-xor").innerHTML = renderStep(
    `XOR dengan ${subkey1Label}`,
    `Hasil EP di-XOR dengan sub-key ${subkey1Label}.`,
    [
      { label: "Hasil EP", bits: r1.epResult },
      { label: `Sub-key ${subkey1Label}`, bits: r1.subkey, variant: "bitgrid--amber" },
      { raw: `<div class="step__op">⊕ XOR</div>` },
      { label: "Hasil XOR", bits: r1.xorResult, variant: "bitgrid--accent" }
    ]
  );

  document.getElementById("r1-step-split").innerHTML = renderStep(
    "Pembagian Hasil XOR",
    "Hasil XOR (8-bit) dibagi menjadi 2 bagian 4-bit untuk S-Box S0 dan S1.",
    [
      { label: "Input S0 (4-bit)", bits: r1.s0Input },
      { label: "Input S1 (4-bit)", bits: r1.s1Input }
    ]
  );

  document.getElementById("r1-step-sbox").innerHTML = renderStep(
    "Substitusi S-Box (S0 dan S1)",
    "Bit ke-1 & ke-4 menentukan baris, bit ke-2 & ke-3 menentukan kolom pada tabel S-Box.",
    [
      { raw: renderSBoxTable(r1.s0, [[1,0,3,2],[3,2,1,0],[0,2,1,3],[3,1,3,2]], "S0") },
      { label: "Output S0", bits: r1.s0.bits.join(""), variant: "bitgrid--accent" },
      { raw: renderSBoxTable(r1.s1, [[0,1,2,3],[2,0,1,3],[3,0,1,0],[2,1,0,3]], "S1") },
      { label: "Output S1", bits: r1.s1.bits.join(""), variant: "bitgrid--accent" },
      { label: "Gabungan S0 + S1", bits: r1.sboxCombined, variant: "bitgrid--accent" }
    ]
  );

  document.getElementById("r1-step-p4").innerHTML = renderStep(
    "Permutasi P4",
    "Gabungan hasil S-Box (4-bit) dipermutasi dengan tabel P4 = [2,4,3,1].",
    [{ label: "Hasil P4", bits: r1.p4Result, variant: "bitgrid--accent" }]
  );

  document.getElementById("r1-step-xorL").innerHTML = renderStep(
    "XOR dengan Bagian Kiri IP (L0)",
    "Hasil P4 di-XOR dengan bagian kiri (L0) dari hasil Initial Permutation.",
    [
      { label: "Hasil P4", bits: r1.p4Result },
      { label: "L0 (kiri IP)", bits: r1.input_left },
      { raw: `<div class="step__op">⊕ XOR</div>` },
      { label: "Hasil XOR (L baru)", bits: r1.newLeft, variant: "bitgrid--accent" }
    ]
  );

  document.getElementById("r1-step-combine").innerHTML = renderStep(
    "Penggabungan",
    "4-bit kiri hasil XOR digabung dengan 4-bit kanan IP (R0, tidak berubah).",
    [
      { label: "Kiri (baru)", bits: r1.newLeft },
      { label: "Kanan (R0)", bits: r1.input_right },
      { label: "Gabungan", bits: r1.combinedBeforeSwap, variant: "bitgrid--accent" }
    ]
  );

  document.getElementById("r1-step-swap").innerHTML = renderStep(
    "Swap (SW)",
    "Bagian kiri dan kanan ditukar posisinya.",
    [
      { label: "Sebelum Swap", bits: r1.combinedBeforeSwap },
      { label: "Setelah Swap", bits: r1.combinedAfterSwap, variant: "bitgrid--amber" }
    ]
  );

  // --- D. Round 2 ---
  document.getElementById("r2-step-ep").innerHTML = renderStep(
    "Expansion Permutation (EP)",
    "Bagian kanan hasil Round 1 (R1) diperluas menjadi 8-bit menggunakan tabel EP.",
    [
      { label: "R1 (4-bit)", bits: r2.input_right },
      { label: "Hasil EP (8-bit)", bits: r2.epResult, variant: "bitgrid--accent" }
    ]
  );

  document.getElementById("r2-step-xor").innerHTML = renderStep(
    `XOR dengan ${subkey2Label}`,
    `Hasil EP di-XOR dengan sub-key ${subkey2Label}.`,
    [
      { label: "Hasil EP", bits: r2.epResult },
      { label: `Sub-key ${subkey2Label}`, bits: r2.subkey, variant: "bitgrid--amber" },
      { raw: `<div class="step__op">⊕ XOR</div>` },
      { label: "Hasil XOR", bits: r2.xorResult, variant: "bitgrid--accent" }
    ]
  );

  document.getElementById("r2-step-split").innerHTML = renderStep(
    "Pembagian Hasil XOR",
    "Hasil XOR (8-bit) dibagi menjadi 2 bagian 4-bit untuk S-Box S0 dan S1.",
    [
      { label: "Input S0 (4-bit)", bits: r2.s0Input },
      { label: "Input S1 (4-bit)", bits: r2.s1Input }
    ]
  );

  document.getElementById("r2-step-sbox").innerHTML = renderStep(
    "Substitusi S-Box (S0 dan S1)",
    "Bit ke-1 & ke-4 menentukan baris, bit ke-2 & ke-3 menentukan kolom pada tabel S-Box.",
    [
      { raw: renderSBoxTable(r2.s0, [[1,0,3,2],[3,2,1,0],[0,2,1,3],[3,1,3,2]], "S0") },
      { label: "Output S0", bits: r2.s0.bits.join(""), variant: "bitgrid--accent" },
      { raw: renderSBoxTable(r2.s1, [[0,1,2,3],[2,0,1,3],[3,0,1,0],[2,1,0,3]], "S1") },
      { label: "Output S1", bits: r2.s1.bits.join(""), variant: "bitgrid--accent" },
      { label: "Gabungan S0 + S1", bits: r2.sboxCombined, variant: "bitgrid--accent" }
    ]
  );

  document.getElementById("r2-step-p4").innerHTML = renderStep(
    "Permutasi P4",
    "Gabungan hasil S-Box (4-bit) dipermutasi dengan tabel P4 = [2,4,3,1].",
    [{ label: "Hasil P4", bits: r2.p4Result, variant: "bitgrid--accent" }]
  );

  document.getElementById("r2-step-xorL").innerHTML = renderStep(
    "XOR dengan Bagian Kiri (L1)",
    "Hasil P4 di-XOR dengan bagian kiri (L1) hasil Round 1.",
    [
      { label: "Hasil P4", bits: r2.p4Result },
      { label: "L1 (kiri Round 1)", bits: r2.input_left },
      { raw: `<div class="step__op">⊕ XOR</div>` },
      { label: "Hasil XOR (L baru)", bits: r2.newLeft, variant: "bitgrid--accent" }
    ]
  );

  document.getElementById("r2-step-combine").innerHTML = renderStep(
    "Penggabungan (Tanpa Swap)",
    "4-bit kiri hasil XOR digabung dengan 4-bit kanan (R1, tidak berubah). Tidak ada swap setelah Round 2.",
    [
      { label: "Kiri (L2)", bits: r2.L2 },
      { label: "Kanan (R2)", bits: r2.R2 },
      { label: "Gabungan", bits: r2.combined, variant: "bitgrid--amber" }
    ]
  );

  // --- E. Output Akhir ---
  document.getElementById("final-step-ipinv").innerHTML = renderStep(
    "Inverse Initial Permutation (IP-1)",
    "Hasil gabungan Round 2 (8-bit) dipermutasi dengan tabel IP-1 = [4,1,3,5,7,2,8,6].",
    [
      { label: "Input IP-1", bits: ipInverse.input },
      { label: "Hasil IP-1", bits: ipInverse.result, variant: "bitgrid--accent" }
    ]
  );

  document.getElementById("final-step-result").innerHTML = renderStep(
    mode === "encrypt" ? "Ciphertext (Hasil Enkripsi)" : "Plaintext (Hasil Dekripsi)",
    "Hasil akhir proses S-DES.",
    [{ label: "Output", bits: result.output, variant: "bitgrid--amber" }]
  );
}

// ---------- Render hasil ringkas ----------
function renderResultSummary(result, input8, mode) {
  const inputLabel = mode === "encrypt" ? "Plaintext" : "Ciphertext";
  const outputLabel = mode === "encrypt" ? "Ciphertext" : "Plaintext";

  document.getElementById("result-input-label").textContent = inputLabel;
  document.getElementById("result-output-label").textContent = outputLabel;
  document.getElementById("result-mode-label").textContent =
    mode === "encrypt" ? "ENKRIPSI" : "DEKRIPSI";

  document.getElementById("result-input-bits").innerHTML = renderBitGrid(input8);
  document.getElementById("result-output-bits").innerHTML = renderBitGrid(result.output, "bitgrid--accent");

  document.getElementById("key-k1-bits").innerHTML = renderBitGrid(result.k1, "bitgrid--small bitgrid--amber");
  document.getElementById("key-k2-bits").innerHTML = renderBitGrid(result.k2, "bitgrid--small bitgrid--amber");
}

// ---------- Main ----------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("sdes-form");
  const inputBitsEl = document.getElementById("input-bits");
  const inputKeyEl = document.getElementById("input-key");
  const errorMsgEl = document.getElementById("error-msg");
  const resultCard = document.getElementById("result-card");
  const solutionSection = document.getElementById("solution-section");
  const toggleBtn = document.getElementById("btn-toggle-solution");

  // Hanya izinkan input 0/1
  [inputBitsEl, inputKeyEl].forEach(el => {
    el.addEventListener("input", () => {
      el.value = el.value.replace(/[^01]/g, "");
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorMsgEl.textContent = "";

    const input8 = inputBitsEl.value.trim();
    const key10 = inputKeyEl.value.trim();
    const mode = document.querySelector('input[name="mode"]:checked').value;

    if (!isValidBits(input8, 8)) {
      errorMsgEl.textContent = "Input plaintext/ciphertext harus berupa 8 digit biner (0/1).";
      resultCard.hidden = true;
      solutionSection.hidden = true;
      return;
    }

    if (!isValidBits(key10, 10)) {
      errorMsgEl.textContent = "Kunci harus berupa 10 digit biner (0/1).";
      resultCard.hidden = true;
      solutionSection.hidden = true;
      return;
    }

    const result = processSDES(input8, key10, mode);

    renderResultSummary(result, input8, mode);
    renderSolution(result);

    resultCard.hidden = false;
    // Sembunyikan solusi setiap submit baru, biarkan user toggle sendiri
    solutionSection.hidden = true;
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.querySelector("span").textContent = "Tampilkan Solusi Penyelesaian";

    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  form.addEventListener("reset", () => {
    errorMsgEl.textContent = "";
    resultCard.hidden = true;
    solutionSection.hidden = true;
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.querySelector("span").textContent = "Tampilkan Solusi Penyelesaian";
  });

  toggleBtn.addEventListener("click", () => {
    const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
    toggleBtn.setAttribute("aria-expanded", String(!expanded));
    solutionSection.hidden = expanded;
    toggleBtn.querySelector("span").textContent = expanded
      ? "Tampilkan Solusi Penyelesaian"
      : "Sembunyikan Solusi Penyelesaian";

    if (!expanded) {
      solutionSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
