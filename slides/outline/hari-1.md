# Hari 1 (Senin) – Why and What: Strategi Cloud dan Konsep Landing Zone

**Tujuan hari ini:** peserta memahami mengapa Pertamina membutuhkan landing zone sebelum memindahkan workload apa pun, mengenal konsep inti Azure, dan memetakan estate IT Pertamina saat ini.

**Audiens:** [ALL] – executive dan architect level. Tidak ada command line untuk peserta.

| Topik | Waktu | Slide | Isi |
|---|---|---|---|
| 1.0 Pembukaan | 09:00–09:15 | 1.0-01 – 1.0-08 | Program, aturan, tim, pre-test |
| 1.1 Cloud adoption di sektor energi + workshop mapping | 09:15–12:00 | 1.1-01 – 1.1-18 | CAF, shared responsibility, pergeseran konsep, studi kasus, workshop |
| 1.2 Azure core concepts dan landing zone + Lab 1 | 13:00–15:00 | 1.2-01 – 1.2-22 | Hierarki, region, landing zone, 8 design area, demo D1, Lab 1 |
| 1.3 Design checkpoint 1 | 15:15–16:00 | 1.3-01 – 1.3-03 | Design Pack bagian 1–2, wrap-up |

---

## Topik 1.0 – Pembukaan (09:00–09:15)

#### Slide 1.0-01 · Azure Landing Zone: Design, Operate, and Connect
- **Tipe:** Judul
- **Waktu:** 1 menit
- **Pointers:** Training 5 hari untuk PT Pertamina (Persero) · Hari 1 dari 5 · Nama trainer dan tanggal
- **Ilustrasi:** [MS Learn] Arsitektur konseptual landing zone sebagai background transparan 20%: `https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/media/azure-landing-zone-conceptual-architecture.svg`
- **Speaker notes:** Sambut peserta. Jika ada sponsor Pertamina, persilakan memberi sambutan singkat sebelum slide berikutnya.

#### Slide 1.0-02 · Tujuan program 5 hari
- **Tipe:** Tujuan
- **Waktu:** 2 menit
- **Pointers:**
  - Memutuskan: kapan dan bagaimana Pertamina mengadopsi Azure
  - Mengoperasikan: governance, security, biaya, monitoring
  - Menghubungkan: identitas, jaringan, DNS, dan server on-prem dengan Azure
  - Hasil nyata: **Landing Zone Design Pack** per tim
- **Ilustrasi:** [SmartArt: Basic Chevron Process] 3 chevron biru: “Decide” → “Operate” → “Connect”, di bawahnya satu kotak hijau “Design Pack”.
- **Speaker notes:** Tekankan bahwa training ini bukan sekadar teori. Setiap tim akan menghasilkan dokumen keputusan yang bisa dipakai di proyek nyata.

#### Slide 1.0-03 · Peta perjalanan 5 hari
- **Tipe:** Agenda
- **Waktu:** 2 menit
- **Pointers:** H1 Why & What · H2 Govern · H3 Identity & Network · H4 Hybrid & Operate · H5 Automate & Capstone
- **Ilustrasi:** [Shapes] Garis waktu horizontal dengan 5 lingkaran bernomor. Hari 1–2 berwarna biru muda (label “Strategic – semua peserta”), Hari 3–5 biru tua (label “Technical + Operate”). Di atas Hari 3 dan 4 tambahkan ikon kecil “on-prem ↔ cloud” untuk menandai lab hybrid.
- **Speaker notes:** Jelaskan bahwa hari 1–2 untuk semua peserta di level strategis, hari 3–5 lebih teknis tetapi manager dan analyst tetap aktif di level Operate.

#### Slide 1.0-04 · Bagaimana kita bekerja
- **Tipe:** Konten
- **Waktu:** 2 menit
- **Pointers:**
  - Tim campuran: manager, analyst, engineer
  - Lab dua level: **Build** (membangun) dan **Operate** (memeriksa dan memutuskan)
  - Setiap hari ditutup dengan design checkpoint
  - Parking lot untuk pertanyaan di luar topik
- **Ilustrasi:** [Shapes] Dua kolom: kiri ikon obeng “Build – TECH”, kanan ikon kaca pembesar “Operate – EXEC/ANL”. Panah hijau dari keduanya menuju kotak “Keputusan bersama”.
- **Speaker notes:** Lingkungan lab adalah training tenant, bukan sistem produksi. Jangan memasukkan data atau kredensial asli Pertamina.

#### Slide 1.0-05 · Peran dalam tim
- **Tipe:** Konten
- **Waktu:** 2 menit
- **Pointers:** Platform Owner (manager) · FinOps & Compliance Analyst · Identity Engineer · Network Engineer · Operations Engineer
- **Ilustrasi:** [SmartArt: Radial Cycle] Lingkaran tengah “Tim N”, 5 lingkaran di sekeliling dengan nama peran dan ikon.
- **Speaker notes:** Bagikan kartu peran. Platform Owner yang menandatangani keputusan tim di Design Pack.

#### Slide 1.0-06 · Landing Zone Design Pack
- **Tipe:** Konten
- **Waktu:** 2 menit
- **Pointers:** 9 bagian, diisi bertahap setiap hari · Format: Keputusan – Alasan – Pemilik – Risiko · Dipresentasikan di capstone hari 5
- **Ilustrasi:** [Tabel] 9 baris: 1 Scope & constraint · 2 Tenant & billing · 3 Hierarchy · 4 Policy, security, biaya, RACI · 5 Identity · 6 Topology & IP plan · 7 Connectivity & DNS · 8 Monitoring, backup, DR · 9 Automation & onboarding. Kolom kedua: hari pengisian.
- **Speaker notes:** Tunjukkan contoh satu baris keputusan yang sudah terisi supaya peserta paham formatnya.

#### Slide 1.0-07 · Aturan kelas
- **Tipe:** Konten
- **Waktu:** 1 menit
- **Pointers:** Lab punya batas waktu · Laptop setengah tertutup saat demo · Pertanyaan di luar topik → parking lot · Istirahat mengikuti waktu sholat
- **Ilustrasi:** [Shapes] 4 ikon sederhana dalam grid 2×2.
- **Speaker notes:** Sampaikan jadwal harian: istirahat 10:30, makan siang dan Dzuhur 12:00, istirahat dan Ashar 15:00. Hari Jumat istirahat 11:30–13:00.

#### Slide 1.0-08 · Pre-test
- **Tipe:** Konten
- **Waktu:** 15 menit (boleh lewat sampai 09:30)
- **Pointers:** 20 soal · ±15 menit · Bukan ujian, untuk mengukur titik awal · Hasil dibandingkan dengan post-test hari 5
- **Ilustrasi:** QR code besar ke Microsoft Forms di tengah slide.
- **Speaker notes:** Lab assistant memastikan semua peserta bisa membuka form. Sambil menunggu, siapkan slide topik 1.1.

---

## Topik 1.1 – Cloud Adoption di Sektor Energi + Workshop Current-State Mapping (09:15–12:00)

#### Slide 1.1-01 · Cloud Adoption di Sektor Energi
- **Tipe:** Judul
- **Waktu:** –
- **Pointers:** Hari 1 · 09:15–12:00 · [ALL]
- **Ilustrasi:** Foto/ikon kilang + ikon cloud dihubungkan garis putus-putus.
- **Speaker notes:** –

#### Slide 1.1-02 · Agenda
- **Tipe:** Agenda
- **Waktu:** 1 menit
- **Pointers:**
  - Pembuka dan polling (10’)
  - Cloud Adoption Framework dan posisi landing zone (20’)
  - Shared responsibility dan pergeseran konsep (20’)
  - Studi kasus shadow IT (15’)
  - Konteks Pertamina (10’)
  - Workshop current-state mapping (75’)
- **Ilustrasi:** [SmartArt: Vertical Bullet List] dengan durasi di sisi kanan.
- **Speaker notes:** –

#### Slide 1.1-03 · Tujuan sesi
- **Tipe:** Tujuan
- **Waktu:** 1 menit
- **Pointers:** Di akhir sesi peserta mampu:
  - Menjelaskan driver dan constraint adopsi cloud untuk perusahaan energi
  - Menjelaskan fase Cloud Adoption Framework (CAF) dan posisi landing zone
  - Menjelaskan shared responsibility model
  - Memetakan estate IT: stays / moves / must connect
- **Ilustrasi:** Ikon target di kiri.
- **Speaker notes:** –

#### Slide 1.1-04 · Polling: titik awal kita
- **Tipe:** Konten (interaktif)
- **Waktu:** 5 menit
- **Pointers:** Siapa sudah pernah memakai Azure? · Cloud lain? · Microsoft 365? · Belum pernah sama sekali?
- **Ilustrasi:** [Shapes] 4 kotak warna untuk angkat tangan, atau QR code polling.
- **Speaker notes:** Sesuaikan kedalaman materi dengan hasil polling. Jika banyak yang belum pernah, perbanyak analogi on-prem.

#### Slide 1.1-05 · Mengapa cloud, mengapa sekarang?
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - **Agility:** proyek baru dalam hari, bukan bulan
  - **Data dan AI:** analitik operasi, predictive maintenance
  - **Resilience:** availability zone, DR tanpa membangun data center baru
  - **Efisiensi:** bayar sesuai pemakaian
- **Ilustrasi:** [SmartArt: Basic Matrix] 4 kuadran dengan ikon untuk setiap driver.
- **Speaker notes:** Minta peserta memberi satu contoh nyata di unit masing-masing untuk satu driver.

#### Slide 1.1-06 · Constraint yang harus dihormati
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Residensi data: UU 27/2022 (PDP), PP 71/2019 – *kerangka diskusi*
  - Pemisahan OT/IT: SCADA, DCS tetap di jaringan OT
  - Audit BUMN dan jejak keputusan
  - Skill dan operating model
- **Ilustrasi:** [Shapes] Timbangan: kiri “Driver” (biru), kanan “Constraint” (oranye). Di bawah: “Landing zone = cara menyeimbangkan keduanya”.
- **Speaker notes:** Trainer bukan penasihat hukum. Interpretasi regulasi menjadi keputusan legal dan compliance Pertamina; landing zone menyediakan kontrol teknisnya.

#### Slide 1.1-07 · Cloud Adoption Framework (CAF)
- **Tipe:** Konten
- **Waktu:** 8 menit
- **Pointers:**
  - **Fondasi:** Strategy · Plan · Ready
  - **Standar operasional:** Govern · Secure · Manage
  - **Onboarding workload:** Migrate · Modernize · Cloud-native
  - Landing zone = hasil fase **Ready**
- **Ilustrasi:** [MS Learn] Diagram metodologi CAF: `https://learn.microsoft.com/azure/cloud-adoption-framework/secure/media/caf-secure-overview.png` · Alternatif [Shapes]: 3 kelompok kotak bertingkat; kotak “Ready” diberi highlight hijau dan label “Landing zone”.
- **Speaker notes:** CAF mengelompokkan adopsi ke tiga blok. Standar operasional dibuat sebelum workload masuk dan berjalan terus-menerus. Itulah mengapa hari 2 (Govern) datang sebelum hari 3–4 (teknis).

#### Slide 1.1-08 · Di mana landing zone berada?
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:** Strategy & Plan → **Ready (landing zone)** → Migrate · Platform harus siap **sebelum** workload pertama · Mulai minimal, kembangkan sesuai kebutuhan
- **Ilustrasi:** [Shapes] Jalan dengan 3 rambu: “Strategy/Plan” → “Ready” (gerbang besar bertuliskan Landing Zone) → “Migrate”. Tanda stop merah di depan gerbang bertuliskan “Tanpa fondasi = shadow IT”.
- **Speaker notes:** Microsoft menyebut kegagalan umum: mendesain landing zone berbulan-bulan tanpa memindahkan workload. Pendekatan yang benar: *minimum viable platform landing zone*.

#### Slide 1.1-09 · Shared responsibility model
- **Tipe:** Konten
- **Waktu:** 8 menit
- **Pointers:**
  - Microsoft: data center fisik, host, jaringan fisik
  - Pertamina **selalu**: data, identitas, akun, perangkat
  - Bervariasi per model: OS, aplikasi, network controls
  - IaaS → PaaS → SaaS: tanggung jawab makin bergeser ke Microsoft
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/security/fundamentals/media/shared-responsibility/shared-responsibility.svg`
- **Speaker notes:** Tekankan baris “responsibility always retained by customer”. Pindah ke cloud tidak memindahkan tanggung jawab atas data dan identitas.

#### Slide 1.1-10 · Pergeseran konsep: on-prem → Azure
- **Tipe:** Konten
- **Waktu:** 10 menit
- **Pointers:** (tabel)
- **Ilustrasi:** [Tabel] 3 kolom: On-premises · Azure · Perbedaan
  - VLAN / segmen → Subnet / VNet · software-defined
  - ACL switch → NSG · stateful, di subnet/NIC
  - Firewall fisik → Azure Firewall / NVA di hub · layanan
  - Static route → UDR · dipasang di subnet
  - Group Policy → Azure Policy · mengatur resource Azure
  - Kapasitas puncak → scale on demand · bayar pemakaian
  - Warm standby → redeploy dari template · berbasis SLA
- **Speaker notes:** Minta engineer memberi contoh nyata untuk tiap baris. Analogi “pets vs cattle”: server on-prem dirawat satu per satu; di cloud, server diganti dengan image baru.

#### Slide 1.1-11 · Yang hilang dan yang baru di meja operasi
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - Hilang: ganti disk, firmware hypervisor, RAID rebuild
  - Baru: RBAC, policy compliance, budget, access review
  - Tetap: patch OS (IaaS), keamanan aplikasi, respons insiden
- **Ilustrasi:** [Shapes] Tiga kolom kartu: abu-abu dicoret (Hilang), biru (Baru), hijau (Tetap).
- **Speaker notes:** Ini pergeseran, bukan pengurangan pekerjaan. Orang yang dulu mengurus hardware dibutuhkan untuk peran baru.

#### Slide 1.1-12 · Studi kasus: “Shadow IT” di perusahaan energi
- **Tipe:** Konten (studi kasus)
- **Waktu:** 3 menit
- **Pointers:**
  - Proyek A: memakai 10.10.0.0/16 → bentrok dengan jaringan kilang
  - Proyek B: RDP terbuka ke internet → brute force
  - Proyek C: tidak ada log → audit gagal
  - Enam bulan kemudian VPN dipasang… dan semuanya bermasalah
- **Ilustrasi:** [Shapes] Tiga awan kecil (Proyek A/B/C) tanpa hubungan; masing-masing dengan ikon peringatan merah: “IP bentrok”, “Port terbuka”, “Tanpa log”. Panah putus-putus merah ke kotak “Data center” bertanda X.
- **Speaker notes:** Cerita fiktif. Bacakan seperti narasi, lalu masuk ke diskusi.

#### Slide 1.1-13 · Diskusi tim (7 menit)
- **Tipe:** Konten (diskusi)
- **Waktu:** 12 menit
- **Pointers:** Keputusan apa yang seharusnya dibuat **sebelum** proyek pertama? · Siapa yang membuat keputusan itu? · Apakah ini pernah terjadi di Pertamina?
- **Ilustrasi:** Timer 7 menit.
- **Speaker notes:** Jawaban yang diharapkan: IP plan terpusat, policy tanpa public IP, central logging, model subscription, pemilik platform. Catat jawaban di whiteboard; ini menjadi jembatan ke landing zone.

#### Slide 1.1-14 · Quiz topik 1.1
- **Tipe:** Quiz
- **Waktu:** 5 menit
- **Pointers (tampil di slide):**
  1. Dalam CAF, landing zone dihasilkan pada fase… A. Strategy B. Ready C. Migrate D. Manage
  2. Pada IaaS, siapa yang bertanggung jawab atas patch sistem operasi VM? A. Microsoft B. Pertamina C. ISP D. Tidak ada
  3. Padanan ACL di switch fisik di Azure adalah… A. Azure Policy B. NSG C. Route table D. Resource group
  4. Tanggung jawab yang **selalu** tetap di pelanggan pada semua model layanan adalah… A. Physical host B. Data dan identitas C. Hypervisor D. Jaringan fisik
  5. Risiko utama adopsi cloud tanpa landing zone adalah… A. Biaya lisensi naik B. Shadow IT: IP bentrok, tanpa logging, akses tidak terkontrol C. VM lebih lambat D. Tidak bisa memakai Microsoft 365
- **Ilustrasi:** Ikon tanda tanya; nomor soal besar.
- **Speaker notes (jawaban):** 1-B (Ready = membangun fondasi/landing zone). 2-B (IaaS: OS tetap tanggung jawab pelanggan). 3-B (NSG adalah filter stateful di subnet/NIC). 4-B (data, identitas, akun, perangkat selalu milik pelanggan). 5-B (contoh di studi kasus).

#### Slide 1.1-15 · Workshop: Current-state mapping
- **Tipe:** Lab (workshop)
- **Waktu:** 75 menit (10:45–12:00)
- **Pointers:**
  - Petakan estate IT Pertamina di kanvas A1
  - 3 warna sticky notes: **Stays** on-prem · **Moves** · **Must connect**
  - Wajib ada: AD, DNS, monitoring, ITSM, backup, SAP, batas OT/IT
  - Gallery walk: 3 menit per tim
- **Ilustrasi:** [Shapes] Contoh kanvas: 3 kolom berwarna (abu-abu Stays, biru Moves, hijau Must connect). Garis merah tebal di kiri bawah bertuliskan “Batas OT”. Beberapa sticky notes contoh: “AD forest”, “SAP ECC”, “Historian kilang”, “SCOM”, “ServiceNow”.
- **Speaker notes:** Berkeliling dan ajukan prompt: “Aplikasi ini login pakai apa?”, “DNS-nya di mana?”, “Siapa yang dapat alert?”. Jika tim hanya menulis aplikasi, minta minimal 5 layanan infrastruktur.

#### Slide 1.1-16 · Pertanyaan pemandu workshop
- **Tipe:** Lab (pendamping)
- **Waktu:** (tampil selama workshop)
- **Pointers:** Identitas: AD forest berapa? · Jaringan: data center, WAN, cabang? · Layanan pendukung: DNS, PKI, NTP, backup? · Siapa pemilik setiap sistem? · Platform kita: baru / parsial / matang?
- **Ilustrasi:** Ikon checklist.
- **Speaker notes:** Jawaban “baru / parsial / matang” menentukan titik awal (build, remediasi, atau validasi).

#### Slide 1.1-17 · Hasil gallery walk
- **Tipe:** Konten (rangkuman workshop)
- **Waktu:** 5 menit
- **Pointers:** Pola yang muncul di semua tim · Komponen “must connect” = kebutuhan hybrid kita · Jembatan ke hari 3–4
- **Ilustrasi:** [Shapes] Kotak kosong untuk foto kanvas tim (ditempel saat kelas berlangsung) atau word cloud dari komponen yang paling sering disebut.
- **Speaker notes:** Isi slide ini secara live dengan foto kanvas.

#### Slide 1.1-18 · Summary topik 1.1
- **Tipe:** Summary
- **Waktu:** 2 menit
- **Pointers:**
  - Cloud mengubah model operasional, bukan hanya lokasi server
  - CAF: fondasi → standar operasional → onboarding workload
  - Data dan identitas selalu tanggung jawab Pertamina
  - Peta current state = bahan desain hybrid
- **Ilustrasi:** 4 ikon centang.
- **Speaker notes:** Transisi: “Setelah makan siang, kita lihat seperti apa landing zone di Azure.”

---

## Topik 1.2 – Azure Core Concepts dan Landing Zone + Lab 1 (13:00–15:00)

#### Slide 1.2-01 · Azure Core Concepts dan Landing Zone
- **Tipe:** Judul
- **Waktu:** –
- **Pointers:** Hari 1 · 13:00–15:00 · [ALL]
- **Ilustrasi:** Logo Azure + ikon hierarki.
- **Speaker notes:** –

#### Slide 1.2-02 · Agenda
- **Tipe:** Agenda
- **Waktu:** 1 menit
- **Pointers:** Hierarki Azure (10’) · Region dan availability zone (8’) · Tenant dan billing (5’) · Landing zone dan 8 design area (17’) · Demo D1 (10’) · Quiz (5’) · Lab 1 (60’)
- **Ilustrasi:** [SmartArt: Vertical Bullet List]
- **Speaker notes:** –

#### Slide 1.2-03 · Tujuan sesi
- **Tipe:** Tujuan
- **Waktu:** 1 menit
- **Pointers:**
  - Menjelaskan hierarki tenant → management group → subscription → resource group → resource
  - Menjelaskan region, availability zone, dan Indonesia Central
  - Membedakan platform dan workload landing zone
  - Menyebutkan 8 design area
  - Menavigasi landing zone di portal
- **Ilustrasi:** Ikon target.
- **Speaker notes:** –

#### Slide 1.2-04 · Hierarki resource di Azure
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - **Management group:** wadah governance di atas subscription
  - **Subscription:** batas billing, kuota, dan akses
  - **Resource group:** wadah lifecycle
  - **Resource:** VM, storage, VNet, dll.
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/architecture/gcp-professional/images/subscription-hierarchy.png`
- **Speaker notes:** Analogi: management group = kebijakan direktorat, subscription = anggaran proyek, resource group = folder pekerjaan.

#### Slide 1.2-05 · Management group dan pewarisan
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Policy dan RBAC di management group **diwariskan** ke bawah
  - Satu tenant = satu root management group
  - Maksimal 6 level di bawah root
  - Desain berdasarkan **perbedaan aturan**, bukan struktur organisasi
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/governance/media/mg-org.png` · Tambahkan [Shapes] panah hijau dari atas ke bawah berlabel “Policy + RBAC diwariskan”.
- **Speaker notes:** Contoh: policy “hanya region Indonesia Central” di satu management group berlaku untuk semua subscription di bawahnya, dan pemilik subscription tidak bisa menghapusnya.

#### Slide 1.2-06 · Region dan availability zone
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - Region: kumpulan data center di satu wilayah
  - Availability zone: data center terpisah (listrik, pendingin, jaringan sendiri)
  - Zone-redundant: layanan tetap jalan jika satu zone gagal
  - Latensi antar-zone ±2 ms
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/reliability/media/availability-zones-overview/regions-availability-zones.svg`
- **Speaker notes:** Availability zone melindungi dari gangguan satu data center, bukan seluruh region.

#### Slide 1.2-07 · Indonesia Central (Jakarta)
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - Region Azure di Jakarta, nama program: `indonesiacentral`
  - **3 availability zone**
  - **Tidak memiliki paired region** → DR lintas region didesain sendiri
  - ExpressRoute lokal: Jakarta, Jakarta2, Jakarta Metro
- **Ilustrasi:** [Shapes] Peta Indonesia sederhana, pin biru di Jakarta dengan 3 lingkaran kecil (AZ1–AZ3). Garis putus-putus merah ke pin abu-abu di Singapura/Kuala Lumpur bertanda “?” dan label “DR lintas negara = keputusan compliance”.
- **Speaker notes:** Fakta ini akan dibahas lagi di hari 4 sebagai keputusan DR. Sumber: daftar region Microsoft Learn.

#### Slide 1.2-08 · Tenant dan billing
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Satu tenant Microsoft Entra ID untuk organisasi (umumnya sudah ada jika memakai Microsoft 365)
  - Model kontrak: EA · MCA · CSP
  - Billing menentukan cara laporan biaya dan pembuatan subscription
  - Keputusan ini masuk Design Pack bagian 2
- **Ilustrasi:** [SmartArt: Hierarchy] Billing account → Tenant → Subscription (3 kotak). Di samping: 3 kartu kecil EA / MCA / CSP.
- **Speaker notes:** Tanyakan kepada peserta apakah Pertamina sudah memakai Microsoft 365. Jika ya, tenant Entra ID kemungkinan sudah ada dan landing zone akan memakai tenant yang sama.

#### Slide 1.2-09 · Apa itu Azure landing zone?
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Lingkungan Azure yang sudah dikonfigurasi: subscription, jaringan, identitas, governance, security, operasi
  - **Platform landing zone:** layanan bersama, dibangun sekali, milik platform team
  - **Workload landing zone:** per aplikasi, milik tim aplikasi
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/media/azure-landing-zone-conceptual-architecture.svg`
- **Speaker notes:** Analogi kawasan industri: platform = jalan, listrik, air, keamanan kawasan; workload = pabrik masing-masing tenant.

#### Slide 1.2-10 · Arsitektur referensi landing zone
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:** Management group: Platform (Identity, Management, Connectivity) · Landing Zones (Corp, Online) · Sandbox · Decommissioned · Hub network di subscription Connectivity
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/cloud-adoption-framework/ready/enterprise-scale/media/azure-landing-zone-architecture-diagram-hub-spoke.svg` (beri highlight pada blok management group dan hub)
- **Speaker notes:** Jangan jelaskan semua kotak. Fokus pada pemisahan Platform vs Landing Zones vs Sandbox.

#### Slide 1.2-11 · Archetype: Corp, Online, Sandbox
- **Tipe:** Konten
- **Waktu:** 3 menit
- **Pointers:**
  - **Corp:** butuh koneksi ke jaringan korporat lewat hub
  - **Online:** akses internet langsung
  - **Sandbox:** eksperimen, terputus dari corp
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/governance/media/mg-org-sub.png`
- **Speaker notes:** Contoh untuk Pertamina: SAP dan aplikasi internal → Corp; portal publik pelanggan → Online; tim data science mencoba layanan baru → Sandbox.

#### Slide 1.2-12 · 8 design area
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:** Billing & tenant · Identity & access · Resource organization · Network & connectivity · Security · Management · Governance · Platform automation & DevOps
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/media/alz-design-areas.svg` · Tambahkan label hari (H1–H5) di setiap area.
- **Speaker notes:** Seluruh minggu mengikuti 8 area ini. Design Pack juga disusun berdasarkan 8 area.

#### Slide 1.2-13 · Minimum viable platform landing zone
- **Tipe:** Konten
- **Waktu:** 3 menit
- **Pointers:**
  - Management group hierarchy + baseline policy
  - Hub network + koneksi hybrid ke on-prem
  - DNS yang menjangkau on-prem
  - Identitas sesuai workload
  - Central logging + firewall
- **Ilustrasi:** [SmartArt: Stacked Pyramid] dasar “Governance”, tengah “Network + DNS + Identity”, atas “Logging + Firewall”. Label di samping: “Cukup untuk workload pertama”.
- **Speaker notes:** Sumber: Microsoft Learn “Azure landing zones for on-premises experts”. Mulai dari blok ini, tambahkan lainnya saat workload membutuhkan.

#### Slide 1.2-14 · Demo D1: Hierarki landing zone di portal
- **Tipe:** Demo (tujuan)
- **Waktu:** 1 menit
- **Pointers:**
  - **Tujuan:** melihat langsung management group, policy yang diwariskan, hub network, dan Log Analytics workspace
  - **Prasyarat:** akun Reader di root training; Azure CLI atau Cloud Shell
- **Ilustrasi:** Ikon layar + play.
- **Speaker notes:** Demo singkat (10 menit). Minta laptop peserta setengah tertutup.

#### Slide 1.2-15 · Demo D1: Sintaks
- **Tipe:** Demo (sintaks)
- **Waktu:** –
- **Pointers (code block di slide):**
  ```bash
  # 1. Daftar management group
  az account management-group list -o table

  # 2. Struktur lengkap (ganti <root-id> dengan ID root training)
  az account management-group show --name <root-id> --expand --recurse \
    --query "children[].{Nama:displayName, Anak:length(children)}" -o table

  # 3. Policy assignment yang berlaku di management group Corp (termasuk warisan)
  az policy assignment list \
    --scope "/providers/Microsoft.Management/managementGroups/<mg-corp>" \
    --disable-scope-strict-match \
    --query "[].{Nama:displayName, Scope:scope}" -o table

  # 4. Hub VNet dan Log Analytics workspace
  az network vnet list --query "[].{Nama:name, RG:resourceGroup, Prefix:addressSpace.addressPrefixes[0]}" -o table
  az monitor log-analytics workspace list --query "[].{Nama:name, RG:resourceGroup}" -o table
  ```
- **Ilustrasi:** Latar gelap, font Consolas.
- **Speaker notes:** Jalankan dari Cloud Shell. Jika CLI lambat, lakukan versi portal pada slide berikutnya.

#### Slide 1.2-16 · Demo D1: Tata cara di portal
- **Tipe:** Demo (langkah)
- **Waktu:** 7 menit
- **Pointers:**
  1. Portal → **Management groups** → expand tree
  2. Pilih Corp → **Policies** → lihat kolom *Scope* (assignment warisan)
  3. Subscription Connectivity → hub VNet → **Subnets** (AzureFirewallSubnet, GatewaySubnet) dan **Peerings**
  4. Subscription Management → **Log Analytics workspace**
- **Ilustrasi:** [SmartArt: Basic Process] 4 langkah.
- **Speaker notes:** Kalimat inti: “Inilah fondasi yang dibangun sekali oleh platform team. Setiap proyek baru cukup meminta subscription dan langsung mewarisi semua aturan ini.”

#### Slide 1.2-17 · Demo D1: Hasil yang diharapkan
- **Tipe:** Demo (hasil)
- **Waktu:** 1 menit
- **Pointers:**
  - Tree: Root → Platform (Identity, Management, Connectivity) · Landing Zones (Corp, Online) · Sandbox · Decommissioned
  - Policy di Corp menampilkan assignment dari level atas
  - Hub VNet memiliki subnet khusus firewall dan gateway
- **Ilustrasi:** [MS Learn] screenshot halaman management group: `https://learn.microsoft.com/azure/governance/management-groups/media/main.png`
- **Speaker notes:** Tunjukkan bahwa scope assignment berbeda dengan lokasi subscription – itulah pewarisan.

#### Slide 1.2-18 · Demo D1: Ilustrasi cadangan (jika portal tidak bisa diakses)
- **Tipe:** Demo (fallback)
- **Waktu:** –
- **Pointers:** Di mana hasilnya terlihat di portal
- **Ilustrasi:** [Mockup portal] Bingkai jendela browser. Bar atas: kotak pencarian bertuliskan “Management groups”. Breadcrumb: `Home > Management groups`. Area tengah: tree dengan indentasi – “Tenant Root Group” → “Pertamina-Training” → cabang “Platform”, “Landing Zones”, “Sandbox”, “Decommissioned”; di bawah “Landing Zones” ada “Corp” dan “Online”. Callout merah berpanah ke “Corp”: “Klik → Policies → kolom Scope menunjukkan assignment warisan”. Callout kedua berpanah ke “Platform > Connectivity”: “Di sini hub VNet dan VPN gateway”.
- **Speaker notes:** Gunakan slide ini jika internet atau portal bermasalah.

#### Slide 1.2-19 · Quiz topik 1.2
- **Tipe:** Quiz
- **Waktu:** 5 menit
- **Pointers (tampil di slide):**
  1. Policy yang di-assign di management group akan… A. Hanya berlaku di management group itu B. Diwariskan ke semua subscription dan resource di bawahnya C. Berlaku untuk tenant lain D. Harus di-assign ulang di setiap subscription
  2. Batas billing dan kuota di Azure adalah… A. Resource group B. Subscription C. Availability zone D. VNet
  3. Apa konsekuensi Indonesia Central tidak memiliki paired region? A. Tidak ada availability zone B. DR lintas region harus didesain secara eksplisit C. Tidak bisa memakai ExpressRoute D. Tidak bisa membuat VM
  4. Workload yang butuh koneksi ke jaringan korporat lewat hub ditempatkan di archetype… A. Online B. Sandbox C. Corp D. Decommissioned
  5. Platform landing zone dimiliki oleh… A. Setiap tim aplikasi B. Platform team / central IT C. Vendor D. Microsoft
- **Ilustrasi:** Ikon tanda tanya.
- **Speaker notes (jawaban):** 1-B (pewarisan ke bawah). 2-B. 3-B (tidak ada pasangan otomatis; zone-redundant tetap tersedia). 4-C. 5-B (dibangun sekali, dipakai bersama).

#### Slide 1.2-20 · Lab 1: Tur landing zone (scavenger hunt)
- **Tipe:** Lab
- **Waktu:** 60 menit (14:00–15:00)
- **Pointers:**
  - **Semua peserta (Operate, Reader):** jawab 8 pertanyaan – jumlah management group, policy yang melarang public IP, address space hub, nama Log Analytics workspace, Owner subscription Connectivity, region yang diizinkan, tag wajib, budget aktif
  - **Build tambahan (TECH):** temukan IP privat Azure Firewall dan route table yang memakainya
  - **Kriteria sukses:** 8/8 jawaban benar; tim tercepat mendapat poin bonus capstone
- **Ilustrasi:** [Shapes] Peta harta karun sederhana: 8 titik bernomor di sepanjang jalur dengan ikon portal di setiap titik.
- **Speaker notes:** Pastikan setiap peserta login sendiri. Kunci jawaban disiapkan pada T-1 dari lingkungan nyata.

#### Slide 1.2-21 · Lab 1: Tips navigasi
- **Tipe:** Lab (pendamping)
- **Waktu:** –
- **Pointers:** Gunakan kotak pencarian portal · Settings > Directories jika tenant salah · Policy > Assignments · Cost Management > Budgets · Sign out/in jika role belum terlihat
- **Ilustrasi:** [Mockup portal] Panah ke kotak pencarian atas dan ikon Settings (gear) di kanan atas.
- **Speaker notes:** Tampilkan selama lab berlangsung.

#### Slide 1.2-22 · Summary topik 1.2
- **Tipe:** Summary
- **Waktu:** 2 menit
- **Pointers:**
  - Hierarki: governance diskalakan lewat management group
  - Indonesia Central: 3 AZ, tanpa paired region
  - Platform vs workload landing zone
  - 8 design area = peta minggu ini
  - Mulai dari minimum viable platform landing zone
- **Ilustrasi:** Ikon centang.
- **Speaker notes:** Transisi ke design checkpoint.

---

## Topik 1.3 – Design Checkpoint 1 (15:15–16:00)

#### Slide 1.3-01 · Design checkpoint 1
- **Tipe:** Lab (workshop)
- **Waktu:** 30 menit
- **Pointers:** Isi Design Pack **bagian 1** (scope, constraint, current state, titik awal) dan **bagian 2** (tenant dan billing) · Format: Keputusan – Alasan – Pemilik – Risiko · Platform Owner menandatangani
- **Ilustrasi:** [Tabel] Contoh satu baris terisi: “Gunakan tenant Entra ID yang sama dengan Microsoft 365 | Satu identitas untuk seluruh karyawan | Tim Identity | Perlu governance admin tenant yang ketat”.
- **Speaker notes:** Trainer memberi feedback 3–4 menit per tim.

#### Slide 1.3-02 · Recap hari 1
- **Tipe:** Summary
- **Waktu:** 10 menit
- **Pointers:** Mengapa landing zone sebelum migrasi · Shared responsibility · Hierarki Azure · 8 design area · Peta current state Pertamina
- **Ilustrasi:** [SmartArt: Basic Cycle] 5 poin.
- **Speaker notes:** Bacakan parking lot. Kumpulkan satu pertanyaan anonim per peserta untuk dijawab besok pagi.

#### Slide 1.3-03 · Besok: Govern before you build
- **Tipe:** Konten (preview)
- **Waktu:** 2 menit
- **Pointers:** Management group dan policy · Security baseline · Biaya dan FinOps · Siapa melakukan apa (RACI)
- **Ilustrasi:** Ikon perisai + koin.
- **Speaker notes:** Ingatkan jam mulai 09:00 dan kuis recap pagi.
