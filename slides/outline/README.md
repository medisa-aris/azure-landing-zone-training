# Outline Slide – Training Azure Landing Zone (Pertamina)

Dokumen ini adalah **blueprint pembuatan slide** untuk training 5 hari *Azure Landing Zone: Design, Operate, and Connect*. Setiap file berisi outline per hari, dibagi per topik/sesi, dengan spesifikasi lengkap untuk setiap slide: judul, pointers, ilustrasi, speaker notes, demo, quiz, lab, dan summary.

Bahasa: **Bahasa Indonesia**. Istilah teknis (jargon) tetap dalam bahasa Inggris.

## Daftar file

| File | Hari | Fokus | Topik |
|---|---|---|---|
| [hari-1.md](hari-1.md) | Senin | Why and what | Pembukaan · Cloud adoption · Azure core concepts dan landing zone |
| [hari-2.md](hari-2.md) | Selasa | Govern before you build | Resource organization dan governance · Security, cost, operating model |
| [hari-3.md](hari-3.md) | Rabu | Identity dan network | Hybrid identity · Network topology |
| [hari-4.md](hari-4.md) | Kamis | Hybrid connectivity dan operasi | Koneksi ke on-premises dan hybrid DNS · Operasi lintas dua dunia |
| [hari-5.md](hari-5.md) | Jumat | Automate, onboard, operate | Platform automation · Workload onboarding · Game day · Capstone dan penutupan |

Dokumen pendamping: `docs/course_syllabus_azure-landing-zone-pertamina.docx` (syllabus) dan `docs/trainer_guide_azure-landing-zone-pertamina.docx` (panduan trainer).

## Struktur standar setiap topik

Setiap topik/sesi mengikuti urutan slide yang sama:

1. **Judul sesi** – nama topik, hari, waktu, audiens.
2. **Agenda** – urutan subtopik dengan alokasi waktu.
3. **Tujuan (objectives)** – yang bisa dilakukan peserta di akhir sesi.
4. **Penjelasan** – beberapa slide konten. Setiap slide memiliki pointers, ilustrasi, dan speaker notes.
5. **Demo** (jika ada) – tujuan, prasyarat, sintaks, tata cara, hasil yang diharapkan, dan ilustrasi cadangan bila portal Azure tidak bisa diakses.
6. **Quiz** – 5 soal pilihan ganda dalam Bahasa Indonesia. **Jawaban dan pembahasan hanya di speaker notes.**
7. **Lab** (jika ada) – apa yang dikerjakan di level Build dan Operate, durasi, dan kriteria sukses.
8. **Summary** – poin yang harus diingat dan jembatan ke sesi berikutnya.

## Format setiap slide

```text
#### Slide <hari>.<topik>-<nomor> · <Judul slide>
- Tipe: Judul | Agenda | Tujuan | Konten | Demo | Quiz | Lab | Summary
- Waktu: perkiraan menit untuk slide ini
- Pointers: poin yang tampil di slide (maks. 5 baris, singkat)
- Ilustrasi: sumber dan deskripsi visual (lihat legenda di bawah)
- Speaker notes: hal yang diucapkan trainer (tidak tampil di slide)
```

## Legenda ilustrasi

| Label | Artinya | Cara membuat |
|---|---|---|
| **[MS Learn]** | Gambar resmi dari Microsoft Learn | Unduh dari URL yang diberikan, cantumkan sumber kecil di pojok kanan bawah: “Sumber: Microsoft Learn”. Jika SVG tidak bisa disisipkan, buka URL di browser lalu screenshot atau konversi ke PNG. |
| **[SmartArt]** | Diagram SmartArt PowerPoint | Insert > SmartArt, gunakan tipe yang disebutkan (contoh: Basic Process, Hierarchy, Cycle, Matrix). |
| **[Shapes]** | Diagram dibuat dengan shapes + arrows | Insert > Shapes. Deskripsi menyebutkan kotak, warna, posisi, dan arah panah. |
| **[Mockup portal]** | Ilustrasi tampilan portal Azure | Dipakai bila portal tidak bisa diakses saat membuat slide atau saat demo. Buat dengan shapes: bingkai jendela, breadcrumb, menu kiri, area konten, dan callout berpanah ke bagian yang penting. |
| **[Tabel]** | Tabel PowerPoint | Insert > Table, maksimal 5 kolom dan 7 baris agar terbaca. |

### Palet warna yang konsisten

| Elemen | Warna | Hex |
|---|---|---|
| Azure / cloud | Biru | `#0F4C81` |
| On-premises Pertamina | Abu-abu tua | `#595959` |
| Keamanan / firewall | Oranye | `#E36C09` |
| Identitas | Ungu | `#7030A0` |
| Alur data / panah utama | Hijau | `#2E7D32` |
| Peringatan / antipattern | Merah | `#C00000` |

## Aturan penting saat membuat slide

- **Satu ide per slide.** Jika pointers lebih dari 5, pecah menjadi dua slide.
- **Ilustrasi lebih penting dari teks.** Pointers cukup kata kunci; penjelasan lengkap ada di speaker notes.
- **Gambar Microsoft Learn** dipakai untuk tujuan edukasi dan selalu diberi atribusi. Periksa ulang URL sebelum delivery karena halaman dokumentasi bisa berubah.
- **Jawaban quiz tidak boleh muncul di slide.** Gunakan slide berikutnya (opsional) atau sampaikan lisan dari speaker notes.
- **Sintaks demo** ditampilkan dengan font monospace (Consolas 14–16 pt), latar gelap, maksimal 12 baris per slide.
- Fakta Azure di outline ini diperiksa terhadap Microsoft Learn pada November 2026. Verifikasi ulang saat dry run.
- **35 URL gambar [MS Learn]** diambil dari hasil pencarian Microsoft Learn, tetapi **belum diuji satu per satu** (jaringan lingkungan pembuatan dokumen ini memblokir `learn.microsoft.com`). Buka setiap URL saat membuat slide; jika ada yang tidak tersedia, cari judul diagram yang sama di halaman Microsoft Learn terkait atau gunakan alternatif [Shapes] yang sudah dideskripsikan.
- Sintaks demo dan lab (Azure CLI, PowerShell, strongSwan, Bicep) **belum dijalankan** di lingkungan Azure; jalankan semuanya saat dry run T-7.

## Ringkasan jumlah slide

| Hari | Topik | Jumlah slide |
|---|---|---|
| 1 | 3 + checkpoint | 51 |
| 2 | 2 + recap + checkpoint | 45 |
| 3 | 2 + recap + checkpoint | 48 |
| 4 | 2 + recap + checkpoint | 49 |
| 5 | 4 + recap | 52 |
