# Slide training

| Folder | Isi |
|---|---|
| `outline/` | Outline slide per hari (Markdown) – sumber konten |
| `pptx/` | Deck PowerPoint per hari, dibangun dari outline di atas template |
| `template/base-template.pptx` | Template master (layout, theme, font) tanpa slide konten |
| `template/assets/` | Latar cover dan tekstur kartu dari template |
| `template/icons/` | Ikon gaya outline (biru `0078D4` dan putih) |
| `template/mslearn/` | (Opsional) gambar Microsoft Learn hasil `fetch_mslearn_images.py` |

## Membangun ulang deck

```bash
python3 scripts/slides/build_deck.py          # semua hari
python3 scripts/slides/build_deck.py 3        # hanya hari 3
```

Ubah konten di `outline/hari-N.md`, lalu bangun ulang. Struktur setiap deck:

1. Cover (latar template, badge "Hari N dari 5")
2. "Hari N sekilas" – pill 5 hari, timeline 09:00–16:00, kartu sesi
3. Per topik (section PowerPoint terpisah): judul sesi → agenda → tujuan → konten → demo (walkthrough, sintaks, tata cara, hasil, ilustrasi cadangan portal) → kuis 1 soal per slide (jawaban + alasan di notes) → hands-on lab → summary dengan kartu "Berikutnya"
4. Slide penutup

## Gambar Microsoft Learn

Lingkungan pembuatan deck tidak dapat mengakses `learn.microsoft.com`, sehingga slide yang merujuk diagram Microsoft Learn menampilkan **panel placeholder** berisi deskripsi dan URL gambar. Untuk menanam gambar asli:

```bash
pip install cairosvg                                  # untuk mengonversi diagram SVG
python3 scripts/slides/fetch_mslearn_images.py
python3 scripts/slides/build_deck.py
```

## Catatan font

Template memakai **Segoe UI / Segoe UI Semibold** (font tema). Font ini tersedia di Windows/Office; di lingkungan tanpa Segoe UI, pratinjau memakai font pengganti sehingga lebar teks bisa sedikit berbeda.
