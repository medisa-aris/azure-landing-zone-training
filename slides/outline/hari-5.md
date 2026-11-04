# Hari 5 (Jumat) – Automate, Onboard, Operate

**Tujuan hari ini:** peserta memahami cara landing zone dideploy dan diubah sebagai kode, merencanakan onboarding workload pertama dengan platform readiness checklist, menangani insiden platform dalam simulasi, dan mempresentasikan Design Pack.

**Audiens:** [ALL] campuran. **Istirahat siang 11:30–13:00 untuk sholat Jumat.**

| Topik | Waktu | Slide | Isi |
|---|---|---|---|
| 5.0 Recap hari 4 | 09:00–09:15 | 5.0-01 | Kuis recap |
| 5.1 Platform automation + Lab 5A | 09:15–10:30 | 5.1-01 – 5.1-17 | ALZ IaC Accelerator, Azure Verified Modules, pull request flow, subscription vending, demo D8, Lab 5A |
| 5.2 Workload onboarding dan platform readiness | 10:45–11:30 | 5.2-01 – 5.2-15 | Azure Migrate, strategi migrasi, workload pertama, readiness checklist, SAP, demo D9 |
| 5.3 Game day | 13:00–14:00 | 5.3-01 – 5.3-10 | Briefing, 4 inject, scoring, debrief, quiz refleksi |
| 5.4 Capstone dan penutupan | 14:15–16:00 | 5.4-01 – 5.4-09 | Presentasi Design Pack, rubric, post-test, roadmap 30-60-90, sertifikasi |

---

## Topik 5.0 – Recap Hari 4 (09:00–09:15)

#### Slide 5.0-01 · Kuis recap hari 4
- **Tipe:** Quiz
- **Waktu:** 10 menit
- **Pointers:**
  1. Mengapa VPN gateway dibuat sebelum kelas?
  2. Sebutkan dua peering location ExpressRoute untuk Indonesia Central.
  3. Zona apa yang diteruskan DNS on-prem ke inbound endpoint untuk blob storage?
  4. Apa yang dikelola Azure Arc, dan apa yang tidak berpindah?
  5. Apa trade-off DR ke Southeast Asia untuk Pertamina?
- **Ilustrasi:** Ikon jam.
- **Speaker notes (jawaban):** 1) Pembuatan gateway butuh 45 menit atau lebih. 2) Jakarta dan Jakarta2 (plus ExpressRoute Metro Jakarta). 3) `blob.core.windows.net` (zona publik). 4) Manajemen server (policy, monitoring, update); server tetap di on-prem. 5) Melindungi dari gangguan region, tetapi data keluar Indonesia – perlu keputusan legal/compliance.

---

## Topik 5.1 – Platform Automation + Lab 5A (09:15–10:30)

#### Slide 5.1-01 · Platform Automation
- **Tipe:** Judul
- **Waktu:** –
- **Pointers:** Hari 5 · 09:15–10:30 · [ALL]
- **Ilustrasi:** Ikon kode + roda gigi.
- **Speaker notes:** –

#### Slide 5.1-02 · Agenda
- **Tipe:** Agenda
- **Waktu:** 1 menit
- **Pointers:** Mengapa IaC (5’) · ALZ IaC Accelerator (10’) · Pull request flow (8’) · Subscription vending dan policy as code (5’) · Demo D8 (10’) · Quiz (5’) · Lab 5A (30’)
- **Ilustrasi:** [SmartArt: Vertical Bullet List]
- **Speaker notes:** –

#### Slide 5.1-03 · Tujuan sesi
- **Tipe:** Tujuan
- **Waktu:** 1 menit
- **Pointers:**
  - Menjelaskan mengapa platform landing zone dikelola sebagai kode
  - Menjelaskan empat fase ALZ IaC Accelerator
  - Membaca hasil plan/what-if dalam pull request
  - Menyetujui atau menolak perubahan platform dengan alasan
- **Ilustrasi:** Ikon target.
- **Speaker notes:** –

#### Slide 5.1-04 · Mengapa infrastructure as code?
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Perubahan bisa direview sebelum diterapkan
  - Lingkungan bisa dibuat ulang secara identik
  - Jejak audit: siapa, apa, kapan, siapa yang menyetujui
  - Mengurangi konfigurasi manual yang “melenceng” (drift)
- **Ilustrasi:** [Shapes] Kiri: orang mengklik portal dengan tanda tanya “siapa mengubah ini?” (merah). Kanan: file kode → Git → pipeline → Azure dengan centang hijau dan ikon log audit.
- **Speaker notes:** Untuk manager: pipeline adalah jejak audit yang mendukung kebutuhan audit BUMN.

#### Slide 5.1-05 · Azure Landing Zones IaC Accelerator
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - Pendekatan yang direkomendasikan Microsoft
  - Bicep **atau** Terraform berbasis **Azure Verified Modules (AVM)**
  - Version control dan pipeline: **GitHub** atau **Azure DevOps**
  - Alternatif tanpa IaC: portal accelerator
- **Ilustrasi:** [Shapes] Tiga pilihan bertumpuk: “Bahasa: Bicep | Terraform” → “VCS: GitHub | Azure DevOps” → “Hasil: repo + pipeline + platform landing zone”.
- **Speaker notes:** Sumber: Microsoft Learn “Platform landing zone implementation options”.

#### Slide 5.1-06 · Empat fase accelerator
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:** **Phase 0 Planning:** pilih IaC dan VCS · **Phase 1 Prerequisites:** kredensial dan subscription · **Phase 2 Bootstrap:** modul PowerShell menyiapkan Azure dan repo · **Phase 3 Run:** sesuaikan kode, jalankan pipeline
- **Ilustrasi:** [SmartArt: Basic Chevron Process] 4 chevron bernomor 0–3.
- **Speaker notes:** Training tenant kita dibangun dengan alur ini sebelum hari 1.

#### Slide 5.1-07 · Alur perubahan: pull request
- **Tipe:** Konten
- **Waktu:** 8 menit
- **Pointers:**
  1. Engineer membuat branch dan mengubah kode
  2. Pull request → pipeline menjalankan **plan / what-if**
  3. Reviewer membaca dampak (resource baru, diubah, dihapus)
  4. Approve → merge → pipeline **apply**
- **Ilustrasi:** [SmartArt: Basic Process] 4 langkah dengan ikon: branch, dokumen diff, orang dengan tanda centang, roket. Panah balik merah dari langkah 3 ke 1 berlabel “Reject + alasan”.
- **Speaker notes:** Tidak ada perubahan manual di portal untuk platform. Perubahan darurat pun dicatat dan dikembalikan ke kode.

#### Slide 5.1-08 · Subscription vending dan policy as code
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Modul **sub-vending** (Bicep) / **lz-vending** (Terraform) membuat workload landing zone
  - Policy sebagai kode: definisi, assignment, exemption di Git
  - Opsi lanjutan: Enterprise Policy as Code (EPAC)
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/governance/policy/media/policy-as-code/policy-as-code-workflow.png`
- **Speaker notes:** –

#### Slide 5.1-09 · Demo D8: ALZ IaC Accelerator dan pipeline
- **Tipe:** Demo (tujuan)
- **Waktu:** 1 menit
- **Pointers:**
  - **Tujuan:** menunjukkan struktur repo platform dan satu perubahan dari branch sampai apply
  - **Prasyarat:** repo hasil bootstrap accelerator untuk training tenant; pipeline pernah berjalan sukses
- **Ilustrasi:** Ikon Git.
- **Speaker notes:** –

#### Slide 5.1-10 · Demo D8: Sintaks
- **Tipe:** Demo (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```powershell
  # Bootstrap (sudah dijalankan sebelum kelas – ditunjukkan sebagai referensi)
  Install-PSResource -Name ALZ
  Deploy-Accelerator -inputs "./config/inputs.yaml" -output "./output"
  ```
  ```bash
  # Perubahan kecil melalui pull request
  git checkout -b feature/tag-businessunit
  # ubah file parameter: tambahkan tag default BusinessUnit
  git commit -am "Tambah tag default BusinessUnit"
  git push -u origin feature/tag-businessunit
  # Buka pull request -> pipeline menjalankan:
  #   Bicep:     az deployment mg what-if ...
  #   Terraform: terraform plan
  ```
- **Ilustrasi:** Latar gelap.
- **Speaker notes:** Parameter perintah accelerator bisa berubah antar versi; ikuti dokumentasi accelerator terbaru saat menyiapkan demo.

#### Slide 5.1-11 · Demo D8: Tata cara dan hasil
- **Tipe:** Demo (langkah + hasil)
- **Waktu:** 8 menit
- **Pointers:**
  1. Tunjukkan struktur repo: konfigurasi management group, policy, hub network
  2. Buat branch, ubah satu parameter, buka pull request
  3. Tunjukkan job **plan/what-if**: “1 to change, 0 to add, 0 to destroy”
  4. Approve dan merge → job **apply** sukses → cek di portal
- **Ilustrasi:** [Shapes] Mockup tampilan pull request: judul PR, status check “plan ✔”, ringkasan diff, tombol “Approve” dan “Merge”.
- **Speaker notes:** Kalimat inti: “Landing zone adalah kode. Mengubahnya sama seperti mengubah aplikasi: review dulu, baru deploy.”

#### Slide 5.1-12 · Demo D8: Ilustrasi cadangan
- **Tipe:** Demo (fallback)
- **Waktu:** –
- **Pointers:** Di mana hasilnya terlihat
- **Ilustrasi:** [Mockup portal] Dua panel. Kiri: halaman pull request (GitHub/Azure DevOps) dengan tab “Checks” – job “plan” berwarna hijau, output ringkas “Plan: 0 to add, 1 to change, 0 to destroy”. Kanan: portal Azure breadcrumb `Resource groups > rg-hub > Tags` menampilkan tag baru `BusinessUnit`. Panah hijau dari tombol “Merge” ke panel kanan berlabel “apply”.
- **Speaker notes:** –

#### Slide 5.1-13 · Quiz topik 5.1
- **Tipe:** Quiz
- **Waktu:** 5 menit
- **Pointers:**
  1. Pendekatan deploy platform landing zone yang direkomendasikan Microsoft adalah… A. Klik manual di portal B. ALZ IaC Accelerator (Bicep/Terraform + AVM) C. Script di laptop admin D. Salin template dari blog
  2. Fase accelerator yang menyiapkan Azure dan repository dengan modul PowerShell adalah… A. Planning B. Prerequisites C. Bootstrap D. Run
  3. Langkah yang menunjukkan dampak perubahan sebelum diterapkan adalah… A. Apply B. Plan/what-if C. Merge D. Rollback
  4. Manfaat utama pull request bagi manager adalah… A. Mempercepat VM B. Jejak audit dan persetujuan perubahan C. Mengurangi lisensi D. Menghapus kebutuhan backup
  5. Modul yang membuat workload landing zone secara otomatis disebut… A. Subscription vending B. Policy exemption C. DNS ruleset D. Arc agent
- **Ilustrasi:** Ikon tanda tanya.
- **Speaker notes (jawaban):** 1-B. 2-C. 3-B. 4-B. 5-A.

#### Slide 5.1-14 · Lab 5A: Platform automation
- **Tipe:** Lab
- **Waktu:** 30 menit
- **Pointers:**
  - **Build (TECH):** tambah spoke/workload landing zone tim melalui modul yang tersedia di folder tim → buka pull request → baca hasil plan
  - **Operate (EXEC/ANL):** bertindak sebagai approver – nilai dampak (resource baru, biaya, policy) → approve atau reject dengan alasan tertulis
  - **Kriteria sukses:** satu pull request per tim dengan plan sukses dan keputusan approver tercatat
- **Ilustrasi:** [Shapes] Dua peran berhadapan: Engineer (ikon laptop) “mengusulkan” → Manager (ikon stempel) “memutuskan”, di tengah dokumen PR.
- **Speaker notes:** Batasi izin repo agar tim hanya mengubah folder masing-masing. Siapkan branch per tim sebelum kelas karena pipeline butuh beberapa menit.

#### Slide 5.1-15 · Lab 5A: Contoh perubahan (Build)
- **Tipe:** Lab (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```bicep
  // teams/team1/spoke.bicepparam (contoh)
  using '../../modules/spoke/main.bicep'
  param teamName       = 'team1'
  param location       = 'indonesiacentral'
  param addressPrefix  = '10.0.11.0/24'
  param hubVnetId      = '<hub-vnet-resource-id>'
  param tags = {
    CostCenter: 'CC-TRAINING-01'
    Owner: 'team1-lead@<tenant>.onmicrosoft.com'
    Environment: 'training'
  }
  ```
- **Ilustrasi:** Latar gelap.
- **Speaker notes:** Isi sesuai modul yang disiapkan di repo training. Reviewer memeriksa: address prefix tidak bentrok, tag lengkap, region benar.

#### Slide 5.1-16 · Checklist reviewer (Operate)
- **Tipe:** Lab (pendamping Operate)
- **Waktu:** –
- **Pointers:** Region sesuai allowed locations? · Address space tidak bentrok? · Tag wajib lengkap? · Ada resource yang dihapus? · Dampak biaya bulanan?
- **Ilustrasi:** Ikon checklist dengan 5 kotak centang.
- **Speaker notes:** Manager menulis alasan approve/reject di komentar pull request.

#### Slide 5.1-17 · Summary topik 5.1
- **Tipe:** Summary
- **Waktu:** 2 menit
- **Pointers:**
  - Platform = kode; perubahan melalui pull request
  - Accelerator: Planning → Prerequisites → Bootstrap → Run
  - Plan/what-if sebelum apply
  - Pipeline = jejak audit
- **Ilustrasi:** Ikon centang.
- **Speaker notes:** –

---

## Topik 5.2 – Workload Onboarding dan Platform Readiness (10:45–11:30)

#### Slide 5.2-01 · Workload Onboarding dan Platform Readiness
- **Tipe:** Judul
- **Waktu:** –
- **Pointers:** Hari 5 · 10:45–11:30 · [ALL]
- **Ilustrasi:** Ikon aplikasi bergerak ke awan melalui gerbang.
- **Speaker notes:** Waktu singkat (45 menit) karena istirahat Jumat dimulai 11:30.

#### Slide 5.2-02 · Agenda dan tujuan
- **Tipe:** Agenda + Tujuan
- **Waktu:** 1 menit
- **Pointers:** Azure Migrate (8’) · Strategi migrasi dan workload pertama (8’) · Platform readiness checklist (10’) · SAP dan AI-ready (4’) · Demo D9 (7’) · Quiz (5’)
  - Tujuan: merencanakan onboarding workload pertama dan memvalidasi kesiapan platform
- **Ilustrasi:** [SmartArt: Vertical Bullet List]
- **Speaker notes:** –

#### Slide 5.2-03 · Azure Migrate: discovery dan assessment
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - **Appliance** di on-prem: discovery VMware, Hyper-V, server fisik
  - **Assessment:** sizing VM, perkiraan biaya, kesiapan
  - **Dependency analysis:** server mana yang saling bergantung
  - Data dikirim melalui HTTPS 443 (internet atau ExpressRoute)
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/migrate/media/migrate-appliance/architecture.png`
- **Speaker notes:** Azure Migrate menilai VM satu per satu, tetapi pemetaan dependensi aplikasi tetap tanggung jawab tim Pertamina.

#### Slide 5.2-04 · Dependency mapping
- **Tipe:** Konten
- **Waktu:** 3 menit
- **Pointers:** Pindahkan server yang saling bergantung bersama · Temukan server yang tidak dipakai (kandidat retire) · Hindari “gangguan kejutan” saat migrasi
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/migrate/media/concepts-migration-planning/expand-client-group.png`
- **Speaker notes:** –

#### Slide 5.2-05 · Strategi migrasi
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:** **Retire** · **Retain** (tetap on-prem) · **Rehost** (lift-and-shift) · **Replatform** · **Refactor** · **Replace** (SaaS)
- **Ilustrasi:** [SmartArt: Basic Matrix] atau 6 kartu berwarna dengan contoh Pertamina di setiap kartu (contoh: Retain = SCADA; Rehost = aplikasi legacy; Replace = email ke Microsoft 365).
- **Speaker notes:** Tidak semua aplikasi harus pindah.

#### Slide 5.2-06 · Memilih workload pertama
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:** Penting bagi bisnis, **tidak kritikal** · Dependensi sedikit · Tim aplikasi antusias · Bisa membuktikan jalur hybrid (identitas, DNS, jaringan, monitoring)
- **Ilustrasi:** [Shapes] Matriks 2×2: sumbu X “Kompleksitas dependensi”, sumbu Y “Nilai bisnis”. Kuadran kiri atas diberi bintang hijau “Kandidat workload pertama”.
- **Speaker notes:** Workload pertama adalah ujian nyata platform, bukan sekadar migrasi.

#### Slide 5.2-07 · Platform readiness checklist (1/2)
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - **Konektivitas:** VPN/ExpressRoute live; VM on-prem menjangkau IP privat Azure
  - **DNS dan routing:** nama on-prem, private DNS, private endpoint resolve dari spoke
  - **Ingress dan segmentasi:** satu pola ingress teruji end-to-end
  - **Policy dan governance:** assignment aktif, region dan exception terdokumentasi, budget aktif
  - **Akses admin:** RBAC via grup, PIM teruji
- **Ilustrasi:** [Tabel] 5 baris dengan kolom “Area · Validasi · Status (☐)”.
- **Speaker notes:** Sumber: Microsoft Learn “Validate platform readiness”. Checklist ini minimum, bukan jaminan semua risiko hilang.

#### Slide 5.2-08 · Platform readiness checklist (2/2)
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - **Monitoring:** diagnostic settings via policy; satu alert terbukti sampai; pemilik patching
  - **Kapasitas:** sesuai kebutuhan nyata, bukan perangkat keras puncak on-prem
  - **Resiliensi:** region, AZ, redundansi gateway, backup sesuai SLA
  - **Subscription handoff:** vending menghasilkan subscription siap pakai
  - **Uji dependensi nyata** workload pertama
- **Ilustrasi:** [Tabel] lanjutan 5 baris.
- **Speaker notes:** Tim akan memakai checklist ini sebagai bagian Design Pack 9.

#### Slide 5.2-09 · SAP dan workload AI
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - **SAP:** VM tersertifikasi SAP, landing zone accelerator khusus SAP, umumnya butuh ExpressRoute
  - **AI:** arsitektur konseptual ALZ terbaru menampilkan Microsoft Foundry di atas landing zone yang sama
  - Fondasi tidak berubah: identitas, jaringan, governance, operasi
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/media/azure-landing-zone-conceptual-architecture.svg` (highlight blok Foundry di bawah workload)
- **Speaker notes:** –

#### Slide 5.2-10 · Demo D9: Azure Migrate assessment
- **Tipe:** Demo (tujuan + prasyarat)
- **Waktu:** 1 menit
- **Pointers:**
  - **Tujuan:** menunjukkan hasil discovery, assessment (ukuran VM dan biaya), dan dependency map
  - **Prasyarat:** project Azure Migrate berisi data contoh, atau rekaman/screenshot (discovery appliance butuh waktu lama)
- **Ilustrasi:** Ikon grafik.
- **Speaker notes:** –

#### Slide 5.2-11 · Demo D9: Tata cara
- **Tipe:** Demo (langkah)
- **Waktu:** 5 menit
- **Pointers:**
  1. Portal → **Azure Migrate** → project training → **Servers, databases and web apps**
  2. **Discovered servers** → daftar server dan OS
  3. **Assessments** → buka assessment → ukuran VM yang direkomendasikan, biaya bulanan, kesiapan
  4. **Dependency analysis** → peta dependensi dua server
- **Ilustrasi:** [SmartArt: Basic Process] 4 langkah.
- **Speaker notes:** Demo ini berbasis portal; tidak ada sintaks CLI yang perlu ditunjukkan.

#### Slide 5.2-12 · Demo D9: Hasil yang diharapkan
- **Tipe:** Demo (hasil)
- **Waktu:** 1 menit
- **Pointers:** Server terdeteksi dengan spesifikasi · Rekomendasi ukuran VM (right-sized) · Estimasi biaya compute dan storage per bulan · Peta dependensi antar server
- **Ilustrasi:** [Tabel] Contoh hasil assessment: Server · Rekomendasi · Biaya/bulan · Kesiapan — “APP-ERP01 · D4s_v5 · (contoh) · Ready”, “DB-ERP01 · E8s_v5 · (contoh) · Ready with conditions”.
- **Speaker notes:** Kalimat inti: “Data assessment yang baik mencegah migrasi yang ternyata lebih mahal dari on-prem.”

#### Slide 5.2-13 · Demo D9: Ilustrasi cadangan
- **Tipe:** Demo (fallback)
- **Waktu:** –
- **Pointers:** Di mana hasilnya terlihat
- **Ilustrasi:** [Mockup portal] Breadcrumb `Azure Migrate > Servers, databases and web apps`. Tiga kartu: “Discovered servers: 42”, “Assessments: 3”, “Dependency analysis: enabled”. Di bawah: tabel assessment dengan kolom “Server · Recommended size · Monthly cost · Readiness”. Callout biru ke “Readiness”: “Ready / Ready with conditions / Not ready”.
- **Speaker notes:** –

#### Slide 5.2-14 · Quiz topik 5.2
- **Tipe:** Quiz
- **Waktu:** 5 menit
- **Pointers:**
  1. Komponen Azure Migrate yang dipasang di on-prem untuk discovery adalah… A. Arc agent B. Azure Migrate appliance C. VPN gateway D. Private Resolver
  2. Strategi untuk aplikasi yang tetap di on-prem disebut… A. Rehost B. Retain C. Refactor D. Replace
  3. Kriteria workload pertama yang baik adalah… A. Paling kritikal B. Dependensi paling banyak C. Penting tetapi tidak kritikal, dependensi sedikit D. Tanpa pemilik
  4. Bukti konektivitas pada readiness checklist adalah… A. VM on-prem bisa menjangkau IP privat Azure melalui jalur yang disetujui B. Portal bisa dibuka C. Ada subscription D. Ada budget
  5. Mengapa dependency analysis penting? A. Menambah biaya B. Server yang saling bergantung dipindah bersama dan mencegah gangguan C. Mengganti backup D. Mengganti DNS
- **Ilustrasi:** Ikon tanda tanya.
- **Speaker notes (jawaban):** 1-B. 2-B. 3-C. 4-A. 5-B.

#### Slide 5.2-15 · Summary topik 5.2
- **Tipe:** Summary
- **Waktu:** 1 menit
- **Pointers:**
  - Discovery dan dependency sebelum memilih strategi
  - Tidak semua aplikasi pindah
  - Workload pertama = ujian platform
  - Readiness checklist sebelum migrasi pertama
- **Ilustrasi:** Ikon centang.
- **Speaker notes:** Ingatkan: istirahat dan sholat Jumat 11:30–13:00; game day mulai tepat 13:00.

---

## Topik 5.3 – Game Day (13:00–14:00)

> Tidak ada lab terpisah: game day **adalah** latihan praktiknya. Inject 1 dan 3 dilakukan **live** di lingkungan lab; inject 2 dan 4 memakai kartu/screenshot. Jawaban dan hint hanya di speaker notes.

#### Slide 5.3-01 · Game Day: Insiden Platform
- **Tipe:** Judul
- **Waktu:** –
- **Pointers:** Hari 5 · 13:00–14:00 · [ALL]
- **Ilustrasi:** Ikon sirene.
- **Speaker notes:** 2 menit sebelum inject 1, ganti PSK connection setiap tim di Azure.

#### Slide 5.3-02 · Briefing dan aturan
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - 4 insiden, ±12 menit per insiden
  - Peran: **Incident Commander** (manager) · **Scribe** (analyst) · Engineer
  - Catat: diagnosis · pemilik · eskalasi · komunikasi
  - Hint diberikan setelah 5 menit
- **Ilustrasi:** [Tabel] Skor per inject: Diagnosis benar 2 · Pemilik tepat 1 · Eskalasi tepat 1 · Komunikasi jelas 1 (maks. 5).
- **Speaker notes:** Tampilkan timer besar selama game day.

#### Slide 5.3-03 · Inject 1 (live): “Aplikasi tidak bisa diakses”
- **Tipe:** Konten (inject)
- **Waktu:** 12 menit
- **Pointers:** “User cabang tidak bisa membuka aplikasi di Azure sejak 10 menit lalu.” · Apa yang Anda periksa pertama? · Siapa yang dihubungi?
- **Ilustrasi:** [Shapes] Kartu insiden merah: waktu, pelapor, gejala.
- **Speaker notes:** **Hint (menit 5):** “Lihat status Connection dan log RTR01.” **Jawaban:** status Not connected; log `AUTHENTICATION_FAILED` → PSK berubah. Pemilik: tim network. Eskalasi: change management (siapa mengubah PSK tanpa change request?). Komunikasi ke user cabang dan manajemen.

#### Slide 5.3-04 · Inject 2 (kartu): “Storage ditolak dari on-prem”
- **Tipe:** Konten (inject)
- **Waktu:** 12 menit
- **Pointers:** Output `nslookup` dari server on-prem menunjukkan **IP publik** storage; aplikasi mendapat error akses ditolak.
- **Ilustrasi:** [Shapes] Kartu berisi screenshot/teks output nslookup dengan IP 20.x.x.x, dan cuplikan konfigurasi forwarder “blob.core.windows.net → 168.63.129.16”.
- **Speaker notes:** **Hint:** “Forwarder di DNS on-prem diarahkan ke mana?” **Jawaban:** forwarder menunjuk `168.63.129.16` (tidak terjangkau dari luar VNet). Perbaiki ke IP inbound endpoint resolver. Pemilik: tim DNS/platform.

#### Slide 5.3-05 · Inject 3 (live): “Azure rusak!”
- **Tipe:** Konten (inject)
- **Waktu:** 12 menit
- **Pointers:** Tim proyek mengeluh deployment selalu gagal. Minta tim mencoba deploy storage account di **Southeast Asia**.
- **Ilustrasi:** [Shapes] Kartu dengan pesan email marah dari “Project Manager”.
- **Speaker notes:** **Hint:** “Baca pesan error lengkap.” **Jawaban:** `RequestDisallowedByPolicy` – allowed locations. Bukan insiden; jelaskan aturan dan proses exemption jika ada alasan bisnis. Komunikasi: edukasi, bukan perbaikan teknis.

#### Slide 5.3-06 · Inject 4 (kartu): “Biaya melonjak + alert keamanan”
- **Tipe:** Konten (inject)
- **Waktu:** 12 menit
- **Pointers:** Budget alert **150%** · Defender alert: brute force RDP pada VM dengan public IP
- **Ilustrasi:** [Shapes] Dua kartu berdampingan: screenshot budget alert (grafik melewati garis 100%) dan Defender alert (merah, severity High).
- **Speaker notes:** **Hint:** “Group cost by resource dan tag.” **Jawaban:** VM besar tanpa tag Owner dengan RDP terbuka. Tindakan: hapus public IP/tutup port, isolasi VM, kirim ke SOC, cari pembuat melalui activity log, usulkan policy deny public IP.

#### Slide 5.3-07 · Skor game day
- **Tipe:** Konten
- **Waktu:** 3 menit
- **Pointers:** (diisi live)
- **Ilustrasi:** [Tabel] Tim · Inject 1 · Inject 2 · Inject 3 · Inject 4 · Total.
- **Speaker notes:** Kembalikan PSK yang benar untuk semua tim sebelum capstone.

#### Slide 5.3-08 · Debrief
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:** Monitoring apa yang seharusnya memberi tahu kita lebih dulu? · Runbook mana yang belum ada? · Apa yang perlu ditambahkan ke Design Pack bagian 8?
- **Ilustrasi:** [Shapes] Siklus: Deteksi → Diagnosis → Perbaikan → Pelajaran → (kembali ke) Deteksi.
- **Speaker notes:** Hubungkan setiap inject ke kontrol pencegahnya: alert status VPN, standar DNS, komunikasi policy, policy deny public IP.

#### Slide 5.3-09 · Quiz refleksi game day
- **Tipe:** Quiz
- **Waktu:** 3 menit
- **Pointers:**
  1. Log strongSwan `AUTHENTICATION_FAILED` paling mungkin disebabkan oleh… A. Proposal enkripsi B. PSK tidak cocok C. DNS D. Policy
  2. Forwarder on-prem yang mengarah ke 168.63.129.16 akan… A. Berhasil B. Gagal karena IP itu tidak terjangkau dari luar VNet C. Lebih cepat D. Mengaktifkan ExpressRoute
  3. Error `RequestDisallowedByPolicy` berarti… A. Azure sedang down B. Deployment melanggar policy yang di-assign C. Kuota habis D. Kartu kredit ditolak
  4. Kontrol yang mencegah inject 4 terulang adalah… A. Policy deny public IP + tag wajib Owner B. Menambah budget C. Mematikan Defender D. Memberi semua orang Owner
  5. Peran yang memimpin koordinasi selama insiden adalah… A. Scribe B. Incident Commander C. Vendor D. Auditor
- **Ilustrasi:** Ikon tanda tanya.
- **Speaker notes (jawaban):** 1-B. 2-B. 3-B. 4-A. 5-B.

#### Slide 5.3-10 · Summary game day
- **Tipe:** Summary
- **Waktu:** 1 menit
- **Pointers:**
  - Insiden hybrid sering berasal dari perubahan konfigurasi, DNS, dan komunikasi
  - Setiap alert butuh pemilik dan runbook
  - Policy mencegah, monitoring mendeteksi, proses memperbaiki
- **Ilustrasi:** Ikon centang.
- **Speaker notes:** Istirahat 14:00–14:15, lalu capstone.

---

## Topik 5.4 – Capstone dan Penutupan (14:15–16:00)

#### Slide 5.4-01 · Capstone: Landing Zone Design Pack
- **Tipe:** Judul
- **Waktu:** –
- **Pointers:** Hari 5 · 14:15–15:30 · Presentasi tim
- **Ilustrasi:** Ikon piala.
- **Speaker notes:** –

#### Slide 5.4-02 · Format presentasi
- **Tipe:** Konten
- **Waktu:** 2 menit
- **Pointers:**
  - 15 menit persiapan
  - 10 menit presentasi + 5 menit tanya jawab per tim
  - Workload kasus: SAP non-production / dashboard operasi / data platform
  - Panel “steering committee”: sponsor Pertamina, lead trainer, peserta senior tim lain
- **Ilustrasi:** [Shapes] Garis waktu presentasi per tim dengan blok 10’ dan 5’.
- **Speaker notes:** Atur urutan tim secara acak.

#### Slide 5.4-03 · Struktur presentasi yang disarankan
- **Tipe:** Konten
- **Waktu:** (tampil selama persiapan)
- **Pointers:** 1 Workload dan constraint · 2 Hierarchy dan policy · 3 Identitas · 4 Jaringan, konektivitas, DNS · 5 Operasi, biaya, DR · 6 Risiko dan langkah berikutnya
- **Ilustrasi:** [SmartArt: Vertical Chevron List] 6 langkah.
- **Speaker notes:** –

#### Slide 5.4-04 · Pertanyaan panel
- **Tipe:** Konten
- **Waktu:** (dipakai panel)
- **Pointers:** Keputusan paling berisiko? · Bagaimana user on-prem login? · Bagaimana DNS-nya? · Siapa menerima alert pertama? · Perkiraan biaya bulanan dan siapa membayar? · Apa yang terjadi jika Indonesia Central bermasalah?
- **Ilustrasi:** Ikon tanda tanya besar.
- **Speaker notes:** Panel tidak perlu memakai semua pertanyaan; pilih 2–3 per tim.

#### Slide 5.4-05 · Rubric penilaian
- **Tipe:** Konten
- **Waktu:** 2 menit
- **Pointers:** (tabel)
- **Ilustrasi:** [Tabel] Kriteria · Indikator · Bobot
  - Kelengkapan · 8 design area punya keputusan, pemilik, alasan · 25%
  - Hybrid connectivity · jalur identitas, routing, DNS eksplisit dan teruji · 20%
  - Governance dan compliance · policy sesuai residensi data dan audit · 20%
  - Operasi dan biaya · monitoring, alert, backup/DR, model biaya · 20%
  - Komunikasi · jelas untuk eksekutif dan engineer · 15%
- **Speaker notes:** Tambahkan poin bonus dari Lab 1 (scavenger hunt).

#### Slide 5.4-06 · Post-test
- **Tipe:** Quiz (asesmen akhir)
- **Waktu:** 15 menit (15:30–15:45)
- **Pointers:** 20 soal · topik sama dengan pre-test · hasil dibandingkan per peserta dan per role
- **Ilustrasi:** QR code besar ke Microsoft Forms.
- **Speaker notes:** Post-test menggantikan quiz 5 soal untuk topik penutup. Hasil pre vs post masuk laporan ke Pertamina.

#### Slide 5.4-07 · Roadmap 30-60-90 hari
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - **30 hari:** bentuk platform team/CCoE · putuskan tenant dan billing · jalankan Azure Landing Zone Review · pilih workload pertama
  - **60 hari:** deploy minimum viable platform landing zone dengan accelerator · VPN ke data center · pilot identity sync · ajukan ExpressRoute
  - **90 hari:** validasi readiness · migrasi workload pertama · runbook operasi · review biaya bulanan pertama
- **Ilustrasi:** [Shapes] Tiga anak tangga naik dengan label 30 / 60 / 90 dan ikon di setiap anak tangga (orang, server, roket).
- **Speaker notes:** Posisikan sebagai rekomendasi; prioritas akhir ditentukan Pertamina.

#### Slide 5.4-08 · Jalur sertifikasi
- **Tipe:** Konten
- **Waktu:** 2 menit
- **Pointers:** **AZ-900** semua peserta · **SC-900** manager/analyst · **AZ-104** administrator · **AZ-700** network engineer · **AZ-305** architect
- **Ilustrasi:** [SmartArt: Hierarchy] AZ-900 di dasar, bercabang ke SC-900, AZ-104, AZ-700, lalu AZ-305 di puncak.
- **Speaker notes:** Rekomendasikan learning path Microsoft Learn sesuai peran.

#### Slide 5.4-09 · Terima kasih
- **Tipe:** Summary (penutup)
- **Waktu:** 3 menit
- **Pointers:**
  - Decide · Operate · Connect
  - Design Pack setiap tim diserahkan ke Pertamina
  - Kontak trainer dan materi lanjutan
- **Ilustrasi:** [MS Learn] Arsitektur konseptual landing zone sebagai background: `https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/media/azure-landing-zone-conceptual-architecture.svg`
- **Speaker notes:** Ucapkan terima kasih kepada sponsor dan peserta. Kumpulkan umpan balik training.
