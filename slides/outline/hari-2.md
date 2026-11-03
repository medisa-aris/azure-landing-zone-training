# Hari 2 (Selasa) – Govern Before You Build

**Tujuan hari ini:** peserta mampu mendesain struktur management group dan subscription, memahami cara Azure Policy dan RBAC menegakkan aturan, serta menetapkan baseline security, model biaya, dan operating model platform.

**Audiens:** [ALL] – executive, architect, dan analyst level. Semua lab di level Operate (Reader) sehingga semua peserta aktif; tugas Build tambahan untuk engineer.

| Topik | Waktu | Slide | Isi |
|---|---|---|---|
| 2.0 Recap hari 1 | 09:00–09:15 | 2.0-01 – 2.0-02 | Kuis recap, jawaban parking lot |
| 2.1 Resource organization dan governance + Lab 2A | 09:15–12:00 | 2.1-01 – 2.1-22 | Management group, subscription vending, naming/tagging, Azure Policy, RBAC, demo D2, Lab 2A |
| 2.2 Security baseline, cost, dan operating model + Lab 2B | 13:00–15:00 | 2.2-01 – 2.2-19 | Zero Trust, Defender for Cloud, Sentinel/SOC, FinOps, CCoE/RAMP, demo D3, Lab 2B, RACI |
| 2.3 Design checkpoint 2 | 15:15–16:00 | 2.3-01 – 2.3-02 | Design Pack bagian 3–4 |

---

## Topik 2.0 – Recap Hari 1 (09:00–09:15)

#### Slide 2.0-01 · Kuis recap hari 1
- **Tipe:** Quiz
- **Waktu:** 8 menit
- **Pointers (tampil di slide):**
  1. Sebutkan 3 kelompok fase CAF.
  2. Apa beda platform dan workload landing zone?
  3. Berapa availability zone di Indonesia Central, dan apa pasangan region-nya?
  4. Sebutkan 3 dari 7 komponen minimum viable platform landing zone.
  5. Di level mana policy sebaiknya di-assign agar berlaku untuk banyak subscription?
- **Ilustrasi:** Ikon jam.
- **Speaker notes (jawaban):** 1) Fondasi (Strategy, Plan, Ready), standar operasional (Govern, Secure, Manage), onboarding workload (Migrate, Modernize, Cloud-native). 2) Platform: layanan bersama milik platform team; workload: per aplikasi milik tim aplikasi. 3) 3 AZ, tidak ada paired region. 4) Hierarchy + baseline policy, hub + koneksi hybrid, DNS ke on-prem, identitas, central logging, firewall. 5) Management group.

#### Slide 2.0-02 · Jawaban parking lot
- **Tipe:** Konten
- **Waktu:** 7 menit
- **Pointers:** (diisi live dari pertanyaan anonim kemarin)
- **Ilustrasi:** Foto flipchart parking lot.
- **Speaker notes:** Jawab singkat; topik yang akan dibahas hari ini cukup disebutkan “dibahas di sesi X”.

---

## Topik 2.1 – Resource Organization dan Governance + Lab 2A (09:15–12:00)

#### Slide 2.1-01 · Resource Organization dan Governance
- **Tipe:** Judul
- **Waktu:** –
- **Pointers:** Hari 2 · 09:15–12:00 · [ALL]
- **Ilustrasi:** Ikon pohon hierarki + perisai.
- **Speaker notes:** –

#### Slide 2.1-02 · Agenda
- **Tipe:** Agenda
- **Waktu:** 1 menit
- **Pointers:** Desain management group (12’) · Subscription vending (8’) · Naming dan tagging (8’) · Azure Policy (20’) · RBAC (10’) · Demo D2 (10’) · Quiz (5’) · Lab 2A (75’)
- **Ilustrasi:** [SmartArt: Vertical Bullet List]
- **Speaker notes:** –

#### Slide 2.1-03 · Tujuan sesi
- **Tipe:** Tujuan
- **Waktu:** 1 menit
- **Pointers:**
  - Mendesain management group hierarchy dan model subscription untuk Pertamina
  - Menyusun naming dan tagging standard
  - Menjelaskan Azure Policy: definition, initiative, assignment, effect, exemption
  - Menerapkan RBAC berbasis grup dan least privilege
  - Membaca compliance dashboard
- **Ilustrasi:** Ikon target.
- **Speaker notes:** –

#### Slide 2.1-04 · Prinsip desain management group
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - Pisahkan berdasarkan **aturan yang berbeda**, bukan struktur organisasi
  - Jangan buat management group untuk dev/test/prod → gunakan subscription berbeda
  - Batasi assignment di root
  - Tentukan **default management group** untuk subscription baru (contoh: Sandbox)
  - Aktifkan proteksi hierarki (hanya admin yang boleh membuat management group)
- **Ilustrasi:** [Shapes] Dua pohon berdampingan. Kiri (merah, dicoret): pohon per direktorat “Hulu / Hilir / Korporat / Keuangan”. Kanan (hijau, centang): pohon per aturan “Platform / Corp / Online / Sandbox”.
- **Speaker notes:** Struktur organisasi sering berubah; aturan teknis lebih stabil. Unit bisnis dibedakan dengan subscription dan tag, bukan management group.

#### Slide 2.1-05 · Usulan hierarki untuk Pertamina
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:** Root → Pertamina → Platform (Identity, Management, Connectivity, Security) · Landing Zones (Corp, Online) · Sandbox · Decommissioned
- **Ilustrasi:** [SmartArt: Organization Chart] Root di atas; di bawahnya “Pertamina”; empat cabang. Beri warna: Platform biru tua, Landing Zones biru, Sandbox kuning, Decommissioned abu-abu. Tambahkan contoh subscription di bawah Corp: “sub-sap-prod”, “sub-hse-app-prod”.
- **Speaker notes:** Ini titik awal diskusi. Tanyakan: apakah anak perusahaan butuh management group sendiri karena aturan berbeda (misal regulasi khusus)?

#### Slide 2.1-06 · Subscription vending
- **Tipe:** Konten
- **Waktu:** 8 menit
- **Pointers:**
  - Proses standar ketika tim aplikasi meminta subscription
  - Otomatis: management group yang benar, spoke VNet, RBAC, budget, tag
  - Dijalankan sebagai kode (Bicep / Terraform)
  - Hasil: tim aplikasi langsung mewarisi semua guardrail
- **Ilustrasi:** [SmartArt: Basic Process] “Form permintaan” → “Approval” → “Pipeline vending” → “Subscription siap (MG + VNet + RBAC + budget + tag)”. Panah hijau.
- **Speaker notes:** Analogi: kavling di kawasan industri yang sudah tersambung listrik, air, dan jalan, bukan tanah kosong.

#### Slide 2.1-07 · Naming standard
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - Pola: `<jenis>-<workload>-<env>-<region>-<nomor>`
  - Contoh: `rg-sap-prod-idc-001`, `vnet-hub-prod-idc-001`, `kv-hse-dev-idc-001`
  - Gunakan singkatan resource dari CAF (rg, vnet, kv, st, vm)
  - Konsisten > sempurna
- **Ilustrasi:** [Shapes] Satu nama dipecah menjadi segmen berwarna dengan label di bawah setiap segmen.
- **Speaker notes:** `idc` = singkatan Indonesia Central (contoh internal; sepakati di Design Pack).

#### Slide 2.1-08 · Tagging standard
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - Tag wajib: `CostCenter` · `Owner` · `Environment` · `DataClassification` · `BusinessUnit`
  - Dasar showback/chargeback biaya
  - Ditegakkan oleh policy (Audit → Modify/Deny)
  - Tag tidak berlaku mundur di laporan biaya
- **Ilustrasi:** [Shapes] Ikon VM dengan 5 label tag menggantung, masing-masing warna berbeda.
- **Speaker notes:** Analyst Pertamina sebaiknya terlibat menentukan nilai CostCenter yang sesuai dengan sistem keuangan.

#### Slide 2.1-09 · Azure Policy: cara kerja
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - **Definition:** aturan dalam JSON
  - **Initiative:** kumpulan definition
  - **Assignment:** definition/initiative yang dipasang di scope (MG, subscription, RG)
  - Evaluasi: saat resource dibuat/diubah, saat assignment baru, dan siklus 24 jam
- **Ilustrasi:** [Shapes] Tiga kotak bertumpuk dari kiri ke kanan: “Definition (JSON)” → masuk ke “Initiative (kumpulan)” → panah ke “Assignment @ scope” → panah ke ikon resource dengan label “Compliant / Non-compliant”.
- **Speaker notes:** Assignment baru butuh sekitar 5 menit untuk berlaku; hasil evaluasi resource tunggal muncul sekitar 15 menit kemudian. Penting saat lab.

#### Slide 2.1-10 · Policy effects
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:** (tabel)
- **Ilustrasi:** [Tabel] Effect · Apa yang terjadi · Contoh
  - Audit · dicatat sebagai non-compliant · VM tanpa backup
  - Deny · deployment ditolak · region selain Indonesia Central
  - Modify · properti diubah otomatis · menambah tag
  - DeployIfNotExists · resource pendukung dibuat · diagnostic settings ke Log Analytics
  - Disabled · policy tidak dievaluasi · masa transisi
- **Speaker notes:** Pola aman: mulai dengan Audit, komunikasikan, lalu naikkan ke Deny.

#### Slide 2.1-11 · Baseline policy saat migrasi
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - Larang public exposure yang tidak dikelola
  - Wajibkan diagnostic settings ke central logging
  - Batasi region (**allowed locations**)
  - Jika ada kebutuhan residensi data → allowed locations adalah **compliance control**
- **Ilustrasi:** [SmartArt: Vertical Box List] 3 kotak dengan ikon: gembok-internet, log, peta.
- **Speaker notes:** Sumber: Microsoft Learn “Azure landing zones for on-premises experts – Policy”.

#### Slide 2.1-12 · Exemption dan policy as code
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - Exemption: pengecualian resmi dengan alasan, pemilik, tanggal kedaluwarsa
  - Bukan “tiket yang dilupakan”
  - Policy disimpan di Git, diuji dengan enforcement mode disabled, lalu diaktifkan
- **Ilustrasi:** [MS Learn] Workflow policy as code: `https://learn.microsoft.com/azure/governance/policy/media/policy-as-code/policy-as-code-workflow.png`
- **Speaker notes:** Di on-prem, pengecualian menumpuk tanpa jejak. Di Azure, exemption terlihat di dashboard compliance.

#### Slide 2.1-13 · RBAC: siapa boleh melakukan apa
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - Role dasar: **Owner** · **Contributor** · **Reader** + role spesifik (Network Contributor, dll.)
  - Assignment = siapa (grup) + role + scope
  - Berikan ke **grup Entra ID**, bukan individu
  - Least privilege; hak admin melalui PIM (hari 3)
- **Ilustrasi:** [Shapes] Rumus visual: [Ikon grup] + [Kartu role] + [Kotak scope] = “Role assignment”. Di bawah: panah pewarisan dari MG ke subscription ke RG.
- **Speaker notes:** Tunjukkan perbedaan: Azure Policy mengatur **apa** yang boleh dibuat; RBAC mengatur **siapa** yang boleh membuat.

#### Slide 2.1-14 · Opsi Sovereign Landing Zone
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - Varian landing zone dengan kontrol kedaulatan tambahan: residensi data, customer-managed keys, confidential computing
  - Sovereignty Baseline policy
  - Microsoft menyarankan dipakai **hanya jika** kebutuhan sovereignty sudah dikonfirmasi
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/cloud-adoption-framework/sovereignty/images/microsoft-sovereign-cloud-conceptual.svg`
- **Speaker notes:** Posisikan sebagai opsi untuk didiskusikan dengan legal/compliance Pertamina, bukan rekomendasi default.

#### Slide 2.1-15 · Demo D2: Policy “Allowed locations”
- **Tipe:** Demo (tujuan)
- **Waktu:** 1 menit
- **Pointers:**
  - **Tujuan:** membuktikan policy Deny menolak deployment di luar region yang diizinkan
  - **Prasyarat:** policy allowed locations (Indonesia Central) ter-assign di management group Landing Zones; resource group demo di Indonesia Central
- **Ilustrasi:** Ikon satpam di pintu gerbang.
- **Speaker notes:** –

#### Slide 2.1-16 · Demo D2: Sintaks
- **Tipe:** Demo (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```bash
  # 1. Lihat assignment allowed locations yang berlaku
  az policy assignment list \
    --scope "/providers/Microsoft.Management/managementGroups/<mg-landingzones>" \
    --disable-scope-strict-match \
    --query "[?contains(displayName,'location')].{Nama:displayName, Scope:scope}" -o table

  # 2. Coba deploy di Southeast Asia  -> DITOLAK
  az storage account create -g rg-demo -n stdemo$RANDOM \
    -l southeastasia --sku Standard_LRS

  # 3. Deploy di Indonesia Central  -> BERHASIL
  az storage account create -g rg-demo -n stdemo$RANDOM \
    -l indonesiacentral --sku Standard_LRS

  # 4. Ringkasan compliance
  az policy state summarize --resource-group rg-demo -o table
  ```
- **Ilustrasi:** Latar gelap.
- **Speaker notes:** Nama storage account harus unik global; `$RANDOM` membantu di Cloud Shell (bash).

#### Slide 2.1-17 · Demo D2: Tata cara dan hasil
- **Tipe:** Demo (langkah + hasil)
- **Waktu:** 8 menit
- **Pointers:**
  1. Portal: Create storage account → region **Southeast Asia** → Review + create
  2. Hasil: validasi gagal, error **RequestDisallowedByPolicy** dengan nama policy
  3. Policy → Assignments → allowed locations → lihat scope dan parameter
  4. Ulangi di **Indonesia Central** → berhasil
- **Ilustrasi:** [Shapes] Dua jalur: atas (Southeast Asia) berakhir di tanda STOP merah “RequestDisallowedByPolicy”; bawah (Indonesia Central) berakhir di centang hijau “Deployment succeeded”.
- **Speaker notes:** Kalimat inti: “Policy bekerja seperti satpam di pintu masuk. Engineer tidak perlu menghafal semua aturan; platform yang menegakkannya.”

#### Slide 2.1-18 · Demo D2: Ilustrasi cadangan
- **Tipe:** Demo (fallback)
- **Waktu:** –
- **Pointers:** Di mana error policy terlihat di portal
- **Ilustrasi:** [Mockup portal] Halaman “Create a storage account” tab **Review + create**. Banner merah di atas: “Validation failed. Required information is missing or not valid.” Panel detail di kanan berisi “RequestDisallowedByPolicy – Resource 'stdemo…' was disallowed by policy. Policy: Allowed locations”. Callout oranye berpanah ke nama policy: “Klik untuk melihat assignment dan scope”.
- **Speaker notes:** Pakai jika portal tidak tersedia.

#### Slide 2.1-19 · Quiz topik 2.1
- **Tipe:** Quiz
- **Waktu:** 5 menit
- **Pointers:**
  1. Dasar terbaik untuk memisahkan management group adalah… A. Struktur direktorat B. Perbedaan aturan (policy/RBAC/konektivitas) C. Lokasi kantor D. Nama aplikasi
  2. Effect yang menolak deployment yang tidak sesuai adalah… A. Audit B. Modify C. Deny D. Disabled
  3. Effect untuk membuat diagnostic settings secara otomatis adalah… A. Append B. DeployIfNotExists C. Audit D. Deny
  4. Azure Policy mengatur ___, RBAC mengatur ___. A. siapa; apa B. apa yang boleh dibuat; siapa yang boleh melakukan C. biaya; jaringan D. identitas; region
  5. Pengecualian resmi terhadap policy dengan alasan dan tanggal kedaluwarsa disebut… A. Initiative B. Exemption C. Remediation D. Definition
- **Ilustrasi:** Ikon tanda tanya.
- **Speaker notes (jawaban):** 1-B. 2-C. 3-B. 4-B. 5-B.

#### Slide 2.1-20 · Lab 2A: Governance in practice
- **Tipe:** Lab
- **Waktu:** 75 menit (10:45–12:00)
- **Pointers:**
  - **Operate (semua):** buka Policy > Compliance, temukan resource non-compliant, baca alasannya, telusuri role di Access control (IAM), catat: % compliance, pemilik, keputusan perbaikan
  - **Build (TECH):** buat custom policy “resource group wajib tag CostCenter” (Audit), assign ke subscription tim, jalankan remediation untuk policy Modify
  - **Kriteria sukses:** laporan compliance tim terisi; custom policy muncul di daftar assignment
- **Ilustrasi:** [Shapes] Alur: “Compliance dashboard” → “Resource non-compliant” → “Pemilik (IAM)” → “Keputusan: perbaiki / exemption”.
- **Speaker notes:** Resource non-compliant sudah disiapkan pada T-3 karena evaluasi assignment baru butuh waktu. Untuk memaksa evaluasi: `az policy state trigger-scan --resource-group <rg>`.

#### Slide 2.1-21 · Lab 2A: Sintaks custom policy (Build)
- **Tipe:** Lab (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```json
  // rule.json – hanya bagian policyRule
  {
    "if": { "allOf": [
      { "field": "type", "equals": "Microsoft.Resources/subscriptions/resourceGroups" },
      { "field": "tags['CostCenter']", "exists": "false" }
    ]},
    "then": { "effect": "audit" }
  }
  ```
  ```bash
  az policy definition create --name rg-require-costcenter \
    --display-name "RG wajib tag CostCenter" --mode All --rules rule.json
  az policy assignment create --name rg-costcenter-audit \
    --policy rg-require-costcenter --scope /subscriptions/<sub-id-tim>
  ```
- **Ilustrasi:** Latar gelap.
- **Speaker notes:** `mode: All` diperlukan karena target adalah resource group. Kesalahan umum: memakai mode Indexed.

#### Slide 2.1-22 · Summary topik 2.1
- **Tipe:** Summary
- **Waktu:** 2 menit
- **Pointers:**
  - Management group berdasarkan aturan, subscription berdasarkan workload/env
  - Subscription vending = kavling siap pakai
  - Tag = dasar biaya dan kepemilikan
  - Policy: Audit dulu, lalu Deny
  - RBAC ke grup, least privilege
- **Ilustrasi:** Ikon centang.
- **Speaker notes:** Transisi: “Setelah aturan ada, bagaimana kita menjaga keamanan dan biaya?”

---

## Topik 2.2 – Security Baseline, Cost, dan Operating Model + Lab 2B (13:00–15:00)

#### Slide 2.2-01 · Security, Cost, dan Operating Model
- **Tipe:** Judul
- **Waktu:** –
- **Pointers:** Hari 2 · 13:00–15:00 · [ALL]
- **Ilustrasi:** Ikon perisai + koin + orang.
- **Speaker notes:** –

#### Slide 2.2-02 · Agenda
- **Tipe:** Agenda
- **Waktu:** 1 menit
- **Pointers:** Zero Trust (8’) · Defender for Cloud dan Key Vault (10’) · Sentinel dan SOC (6’) · FinOps (12’) · Operating model (12’) · Demo D3 (8’) · Quiz (4’) · Lab 2B + RACI (60’)
- **Ilustrasi:** [SmartArt: Vertical Bullet List]
- **Speaker notes:** –

#### Slide 2.2-03 · Tujuan sesi
- **Tipe:** Tujuan
- **Waktu:** 1 menit
- **Pointers:**
  - Menjelaskan prinsip Zero Trust dan security baseline landing zone
  - Membaca secure score dan recommendation di Defender for Cloud
  - Menentukan integrasi alert dengan SOC Pertamina
  - Menerapkan budget, tag, dan showback
  - Menyusun RACI platform
- **Ilustrasi:** Ikon target.
- **Speaker notes:** –

#### Slide 2.2-04 · Zero Trust: tiga prinsip
- **Tipe:** Konten
- **Waktu:** 8 menit
- **Pointers:**
  - **Verify explicitly:** setiap akses diverifikasi (identitas, perangkat, lokasi)
  - **Least privilege:** hak minimum, just-in-time
  - **Assume breach:** segmentasi, deteksi, respons
  - Di cloud, **identitas adalah perimeter utama**
- **Ilustrasi:** [SmartArt: Converging Radial] 3 lingkaran prinsip mengarah ke lingkaran tengah “Zero Trust”. [Shapes] tambahan: kastil dengan parit dicoret merah (“perimeter lama”) di sudut kiri bawah.
- **Speaker notes:** Model “di dalam jaringan = dipercaya” tidak berlaku di cloud. Itulah mengapa hari 3 dimulai dari identitas.

#### Slide 2.2-05 · Security baseline landing zone
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Defender for Cloud: postur keamanan (CSPM) dan proteksi workload
  - Key Vault: secret, key, sertifikat
  - Managed identity: tanpa password di kode
  - Private endpoint: PaaS tanpa akses internet
  - DDoS protection untuk public IP
- **Ilustrasi:** [SmartArt: Stacked List] 5 lapisan dengan ikon.
- **Speaker notes:** Hindari menyimpan password koneksi di konfigurasi aplikasi; gunakan managed identity jika didukung.

#### Slide 2.2-06 · Defender for Cloud: secure score
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Skor postur keamanan dalam persen
  - Dihitung dari security control (Microsoft cloud security benchmark)
  - Recommendation diurutkan berdasarkan risiko
  - Dipantau mingguan oleh pemilik yang jelas
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/defender-for-cloud/media/secure-score-security-controls/single-secure-score-via-ui.png`
- **Speaker notes:** Secure score adalah KPI yang mudah dipahami manager. Jadikan bagian laporan bulanan.

#### Slide 2.2-07 · Sentinel dan SOC Pertamina
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - Opsi A: log Azure dikirim ke SIEM yang sudah ada
  - Opsi B: Microsoft Sentinel sebagai SIEM/SOAR
  - Yang wajib: setiap alert punya **jalur triage dan pemilik**
  - Keputusan berdasarkan biaya, skill SOC, integrasi
- **Ilustrasi:** [Shapes] Kiri: ikon Azure (Defender, Activity Log, Firewall log) → panah hijau ke kotak tengah “Log Analytics”. Dari tengah dua panah: atas ke “Sentinel”, bawah ke “SIEM existing”. Keduanya mengarah ke ikon orang “SOC Pertamina”.
- **Speaker notes:** Tidak perlu memutuskan hari ini; catat opsi di Design Pack.

#### Slide 2.2-08 · FinOps: mengelola biaya cloud
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - **Visibility:** cost analysis per tag, subscription, resource group
  - **Control:** budget + alert di level MG/subscription sejak awal
  - **Optimization:** right-sizing, reservations, savings plan, auto-shutdown
  - Jangan tunda landing zone demi chargeback yang sempurna
- **Ilustrasi:** [SmartArt: Basic Cycle] Inform → Optimize → Operate (siklus FinOps) dengan ikon.
- **Speaker notes:** Data biaya muncul beberapa jam setelah pemakaian; tag tidak berlaku mundur.

#### Slide 2.2-09 · Showback dengan tag
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:** Group by tag `CostCenter` · Bagian “Untagged” = pekerjaan rumah · Tag inheritance dari subscription/RG · Laporan bulanan per unit bisnis
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/cost-management-billing/costs/media/enable-tag-inheritance/cost-analysis-view-tag.png`
- **Speaker notes:** Analyst memegang laporan ini. Tanyakan: siapa di Pertamina yang menerima laporan biaya cloud setiap bulan?

#### Slide 2.2-10 · Operating model: siapa memiliki apa
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - **Cloud Center of Excellence (CCoE):** standar, arsitektur, governance
  - **Platform team:** membangun dan mengoperasikan platform landing zone
  - **Workload team:** membangun dan mengoperasikan aplikasi
  - **Security/SOC:** deteksi dan respons
- **Ilustrasi:** [Shapes] Tiga lapisan horizontal: atas “CCoE (aturan)”, tengah “Platform team (fondasi)”, bawah tiga kotak “Workload team A/B/C”. Kotak vertikal di kanan “Security/SOC” melintasi semua lapisan.
- **Speaker notes:** Platform team semakin fokus pada operating model, bukan mengelola infrastruktur satu per satu.

#### Slide 2.2-11 · CAF Manage: RAMP
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:** **Ready** (tim dan tanggung jawab) · **Administer** (perubahan, konfigurasi, IaC) · **Monitor** (kesehatan, biaya, keamanan) · **Protect** (backup, DR, respons)
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/cloud-adoption-framework/manage/media/caf-manage-ready.svg`
- **Speaker notes:** RAMP menjadi kerangka RACI di lab sore ini.

#### Slide 2.2-12 · Demo D3: Defender for Cloud dan Cost Management
- **Tipe:** Demo (tujuan)
- **Waktu:** 1 menit
- **Pointers:**
  - **Tujuan:** membaca secure score, satu recommendation, biaya per tag, dan budget
  - **Prasyarat:** subscription demo yang sudah berjalan ≥2–3 hari; Defender CSPM foundational aktif
- **Ilustrasi:** Ikon layar.
- **Speaker notes:** –

#### Slide 2.2-13 · Demo D3: Sintaks
- **Tipe:** Demo (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```bash
  # (sekali saja) extension Resource Graph
  az extension add --name resource-graph

  # 1. Secure score per subscription
  az graph query -q "securityresources
    | where type == 'microsoft.security/securescores'
    | extend skor = properties.score.current, maks = properties.score.max
    | project subscriptionId, skor, maks"

  # 2. Resource tanpa tag CostCenter
  az graph query -q "resources
    | where isnull(tags['CostCenter'])
    | project name, type, resourceGroup | limit 20"

  # 3. Budget yang aktif
  az consumption budget list -o table
  ```
- **Ilustrasi:** Latar gelap.
- **Speaker notes:** Resource Graph membaca seluruh subscription yang bisa diakses dalam hitungan detik; berguna untuk analyst.

#### Slide 2.2-14 · Demo D3: Tata cara dan hasil
- **Tipe:** Demo (langkah + hasil)
- **Waktu:** 7 menit
- **Pointers:**
  1. Defender for Cloud → Overview → secure score (%)
  2. Recommendations → buka satu, contoh “management ports should be closed” → resource terdampak + langkah remediasi
  3. Cost Management → Cost analysis → Group by tag `CostCenter` → bagian “Untagged”
  4. Budgets → alert 80% dan 100%
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/defender-for-cloud/media/implement-security-recommendations/recommendations-page.png`
- **Speaker notes:** Kalimat inti: “Security dan biaya bukan proyek sekali jalan. Keduanya dipantau setiap minggu oleh pemilik yang jelas.”

#### Slide 2.2-15 · Demo D3: Ilustrasi cadangan
- **Tipe:** Demo (fallback)
- **Waktu:** –
- **Pointers:** Di mana hasilnya terlihat di portal
- **Ilustrasi:** [Mockup portal] Dua panel berdampingan. Kiri: “Microsoft Defender for Cloud | Overview” dengan kartu “Secure score 62%” (callout: “KPI keamanan bulanan”). Kanan: “Cost Management | Cost analysis” dengan grafik batang bertumpuk, legenda “CostCenter: HSE / SAP / Untagged”; callout merah ke “Untagged”: “Cari pemiliknya”. Breadcrumb masing-masing panel ditampilkan di atas.
- **Speaker notes:** Pakai jika portal tidak tersedia.

#### Slide 2.2-16 · Quiz topik 2.2
- **Tipe:** Quiz
- **Waktu:** 4 menit
- **Pointers:**
  1. Prinsip Zero Trust yang menyatakan “anggap sudah dibobol” adalah… A. Verify explicitly B. Least privilege C. Assume breach D. Defense in depth
  2. Ukuran postur keamanan di Defender for Cloud disebut… A. Compliance score B. Secure score C. Risk index D. Health score
  3. Cara terbaik agar aplikasi mengakses database tanpa menyimpan password adalah… A. Menulis password di file konfigurasi B. Managed identity C. Shared key di email D. Akun admin bersama
  4. Agar biaya bisa dialokasikan ke unit bisnis, yang paling penting adalah… A. Nama VM yang panjang B. Tag konsisten seperti CostCenter C. Region berbeda D. Satu subscription untuk semua
  5. Dalam CAF Manage, singkatan RAMP adalah… A. Ready, Administer, Monitor, Protect B. Review, Apply, Measure, Plan C. Run, Audit, Manage, Patch D. Ready, Adopt, Migrate, Plan
- **Ilustrasi:** Ikon tanda tanya.
- **Speaker notes (jawaban):** 1-C. 2-B. 3-B. 4-B. 5-A.

#### Slide 2.2-17 · Lab 2B: Cost and security posture
- **Tipe:** Lab
- **Waktu:** 40 menit (14:00–14:40)
- **Pointers:**
  - **Operate (semua):** cost analysis per tag, buat budget dengan alert 80%/100% di resource group tim, baca secure score dan 3 recommendation teratas
  - **Build (TECH):** buat remediation task untuk tag yang hilang dan periksa hasilnya
  - **Kriteria sukses:** budget tim aktif; daftar 3 recommendation beserta pemiliknya
- **Ilustrasi:** [Shapes] Dua kartu: “Biaya” (koin) dan “Keamanan” (perisai), masing-masing dengan 3 checklist.
- **Speaker notes:** Gunakan subscription demo yang sudah berjalan beberapa hari, atau screenshot sebagai cadangan, karena data biaya baru muncul setelah beberapa jam.

#### Slide 2.2-18 · Workshop RACI platform
- **Tipe:** Lab (workshop)
- **Waktu:** 20 menit (14:40–15:00)
- **Pointers:** Isi template RACI untuk: management group & policy · hub network · VPN/ExpressRoute · DNS · identity sync · logging · backup · patching · incident response · biaya
- **Ilustrasi:** [Tabel] Kolom: Aktivitas · CCoE · Platform team · Workload team · SOC · Keuangan. Baris contoh: “Mengubah policy baseline | A | R | C | C | I”.
- **Speaker notes:** RACI menjawab pertanyaan “siapa yang dibangunkan jam 2 pagi?”. Manager memimpin, engineer memberi masukan teknis.

#### Slide 2.2-19 · Summary topik 2.2
- **Tipe:** Summary
- **Waktu:** 2 menit
- **Pointers:**
  - Identitas adalah perimeter utama (Zero Trust)
  - Secure score dan budget = KPI yang dipantau rutin
  - Setiap alert punya pemilik dan jalur ke SOC
  - Tag = alokasi biaya
  - Operating model dan RACI sebelum workload pertama
- **Ilustrasi:** Ikon centang.
- **Speaker notes:** –

---

## Topik 2.3 – Design Checkpoint 2 (15:15–16:00)

#### Slide 2.3-01 · Design checkpoint 2
- **Tipe:** Lab (workshop)
- **Waktu:** 35 menit
- **Pointers:** Design Pack **bagian 3** (hierarchy dan model subscription) dan **bagian 4** (baseline policy, security, biaya, RACI)
  - Pertanyaan pemicu: Data apa yang wajib tetap di Indonesia? · Allowed locations langsung Deny atau Audit dulu? · Bagaimana alert Azure sampai ke SOC? · Siapa membayar biaya platform bersama?
- **Ilustrasi:** Ikon dokumen + pena.
- **Speaker notes:** Analyst membacakan dampak biaya dan compliance dari keputusan tim.

#### Slide 2.3-02 · Recap hari 2 dan preview hari 3
- **Tipe:** Summary
- **Waktu:** 10 menit
- **Pointers:** Hari ini: aturan, keamanan, biaya, operating model · Besok: **identitas hybrid** dan **jaringan** – lab hybrid pertama (Cloud Sync dari AD on-prem)
- **Ilustrasi:** [Shapes] Panah dari ikon perisai (hari 2) ke ikon “AD on-prem ↔ Entra ID” (hari 3).
- **Speaker notes:** Ingatkan team lead: besok mereka mengaktifkan role Hybrid Identity Administrator melalui PIM.
