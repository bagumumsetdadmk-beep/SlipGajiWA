# Panduan Deploy ke GitHub & Render.com

Aplikasi Slip Gaji + WhatsApp Gateway ini siap dan sangat direkomendasikan untuk di-deploy ke **Render.com** secara gratis. Aplikasi ini hanya menggunakan Node.js dan tidak wajib mensyaratkan database eksternal karena menggunakan memori sementara dan membaca data langsung dari Excel yang diupload.

Berikut adalah panduan lengkap cara deploy dari awal.

## Tahap 1: Upload (Push) Kode ke GitHub

1. Buat akun di [GitHub](https://github.com/) (jika belum punya).
2. Buat repository baru:
   - Klik ikon **+** di pojok kanan atas, pilih **New repository**.
   - Beri nama repository (contoh: `wa-slip-gaji`).
   - Atur menjadi **Private** (disarankan, agar kode Anda aman) atau Public.
   - Jangan centang "Add a README" atau "Add .gitignore" (kosongkan saja).
   - Klik **Create repository**.
3. **Opsi Paling Mudah (Jika Export AI Studio Gagal):**
   - Di AI Studio, beralih ke menu **Settings** (atau ikon gear/titik tiga), lalu pilih **Download as ZIP**.
   - Simpan file ZIP tersebut ke laptop/komputer Anda dan ekstrak (unzip) foldernya.

4. **Cara Upload ke GitHub (Pilih salah satu):**
   
   **Cara A (Upload Manual via Web - Paling Gampang):**
   - Balik ke halaman repository GitHub yang baru saja Anda buat.
   - Klik tulisan **"uploading an existing file"** (di bawah bagian Quick setup).
   - *Drag-and-drop* (seret) semua file dan folder hasil ekstrak ZIP tadi dari komputer Anda ke halaman GitHub tersebut. (Catatan: Pastikan Anda memilih semua file di *dalam* foldernya, bukan foldernya).
   - Tunggu proses upload selesai, lalu klik tombol hijau **Commit changes**.

   **Cara B (Menggunakan Command Line / Git Bash):**
   - Buka terminal / command prompt di folder hasil ekstrak ZIP tersebut.
   - Ketik perintah berikut secara berurutan:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/USERNAME_ANDA/wa-slip-gaji.git
     git push -u origin main
     ```

## Tahap 2: Deploy ke Render.com

Render.com menyediakan infrastruktur hosting gratis untuk layanan web Node.js yang sangat cocok dengan sistem kita.

1. Buka [Render.com](https://render.com/) dan Daftar/Login. Disarankan mendaftar dengan opsi **Sign up with GitHub**.
2. Setelah login masuk ke Dashboard, klik tombol **New +** dan pilih **Web Service**.
3. Pilih opsi **Build and deploy from a Git repository**, lalu klik **Next**.
4. Hubungkan Render dengan akun GitHub Anda (jika belum). Anda akan disuruh memberi akses Render ke repositori Anda. Cari `wa-slip-gaji` lalu klik **Connect**.
5. Konfigurasi Deployment:
   - **Name**: `wa-slip-gaji` (atau nama domain yang Anda inginkan, akan jadi *nama-app.onrender.com*).
   - **Region**: Pilih *Singapore* jika tersedia agar server lebih dekat/cepat, atau *Frankfurt / Ohio*.
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: Pilih tab **Free** ($0 / month).
6. Abaikan pengaturan environment variables lainnya.
7. Klik **Create Web Service**.

## Tahap 3: Menunggu Proses Build

- Render akan menarik kode Anda dari GitHub dan menjalankan perintah `npm install && npm run build`.
- Proses ini biasanya memakan waktu 2-3 menit.
- Setelah log di terminal menunjukkan `Build successful` dan `Live`, layanan Anda sudah online!
- Anda langsung bisa mengunjungi link aplikasi Anda yang tertera di sebelah kiri atas (contoh: `https://wa-slip-gaji.onrender.com`).

---

## 💡 Keuntungan dan Konsekuensi Menggunakan Format Gratis (Free Tier) Render

Secara default, di paket Free tier-nya Render, server akan **"spin down" (tertidur/mati sementara)** jika tidak ada aktivitas selama 15 menit. 

**Kabar Baiknya untuk Aplikasi Ini:**
1. **Lebih Aman**: Karena server ini mengakses WhatsApp (WA) Anda, mode _spin-down_ dari Render ini berarti aplikasi secara efektif "menutup" dan "mematikan" koneksi WA Anda ketika Anda sedang tidak membukanya (sangat relevan dengan kebutuhan pemutusan otomatis Anda sebelumnya).
2. **Tidak ada Data Hilang**: Aplikasi ini memang tujuannya membaca file Excel sesaat untuk mengirim Slip Gaji, jadi server tidur tidak masalah. Tidak butuh sinkronisasi terus menerus ke database.
3. Saat bendahara butuh lagi, cukup buka domain `.onrender.com` miliknya, hubungkan WA lagi via Scan QR (karena session memori clear), dan jalankan!

Semua pengaturan terkait `.yaml` sudah kami sediakan untuk Render. Anda dijamin bisa langsung *plug-and-play*!
