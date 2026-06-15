## Fitur

* Input plaintext/ciphertext 8-bit dan kunci 10-bit dalam format biner
* Pilihan mode Enkripsi atau Dekripsi
* Visualisasi lengkap Key Schedule: Permutasi P10, pembagian kiri/kanan, Left Shift (LS-1, LS-2), Permutasi P8 → K1 dan K2
* Visualisasi proses enkripsi/dekripsi: Initial Permutation (IP), Round Function 1 dan Round Function 2 (Expansion Permutation/EP, XOR dengan subkey, lookup S-Box S0/S1, Permutasi P4, swap), dan Inverse Initial Permutation (IP⁻¹)
* Detail lookup S-Box S0 dan S1 (baris, kolom, nilai output) untuk setiap round
* Tabel referensi lengkap S-Box S0 dan S1
* Output akhir dalam bentuk bit, ditampilkan dalam kotak bernomor
* Bagian "Tampilkan Solusi Penyelesaian" yang dapat ditampilkan/disembunyikan
* Tombol Submit dan Reset

## Struktur Folder

```
sdes-app/
├── app.py          # Server lokal sederhana (opsional) untuk menjalankan aplikasi
├── index.html      # Halaman utama UI
├── style.css       # Styling aplikasi
├── app.js          # Logika UI & visualisasi
└── sdes.js         # Logika inti algoritma S-DES
```

## Cara Menjalankan

Aplikasi ini full frontend — seluruh logika S-DES berjalan di sisi klien (browser). Ada dua cara menjalankannya:

```
python app.py
```

Buka browser ke `http://localhost:8000`.

## Cara Penggunaan

1. Masukkan plaintext/ciphertext 8-bit dan kunci 10-bit (format biner, hanya angka 0 dan 1).
2. Pilih mode operasi: Enkripsi atau Dekripsi.
3. Klik **SUBMIT**.
4. Lihat hasil pada bagian "Hasil":
   * Output akhir (ciphertext/plaintext) dalam bentuk bit
   * Subkunci K1 dan K2
5. Klik **"Tampilkan Solusi Penyelesaian"** untuk melihat seluruh langkah perhitungan secara rinci, meliputi:
   * Pembangkitan Kunci (P10, split, LS-1, LS-2, P8 → K1/K2)
   * Initial Permutation (IP)
   * Round Function 1 (EP, XOR, S-Box, P4, swap)
   * Round Function 2 (EP, XOR, S-Box, P4)
   * Output Akhir (IP⁻¹)
6. Klik **RESET** untuk mengosongkan semua input dan hasil.
