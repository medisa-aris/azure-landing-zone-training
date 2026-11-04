# Hari 3 (Rabu) – Identity dan Network: Menghubungkan ke Estate yang Ada

**Tujuan hari ini:** peserta mampu memilih model hybrid identity, menerapkan akses admin just-in-time, menyinkronkan user dari AD on-prem ke Entra ID, serta mendesain topologi hub-and-spoke dengan IP plan yang tidak bentrok dengan on-prem.

**Audiens:** mulai teknis. [TECH] mengerjakan Build; [EXEC]/[ANL] mengikuti konsep dan mengerjakan Operate. **Lab hybrid pertama: Lab 3C.**

| Topik | Waktu | Slide | Isi |
|---|---|---|---|
| 3.0 Recap hari 2 | 09:00–09:15 | 3.0-01 | Kuis recap |
| 3.1 Hybrid identity + Lab 3A + Lab 3C | 09:15–12:00 | 3.1-01 – 3.1-24 | Empat keputusan identitas, Connect Sync vs Cloud Sync, sign-in, Conditional Access, PIM, demo D4, Lab 3A, Lab 3C |
| 3.2 Network topology + Lab 3B | 13:00–15:00 | 3.2-01 – 3.2-21 | Pemetaan SDN, hub-and-spoke vs Virtual WAN, IP plan, NSG vs firewall, ingress/egress, Private Link, forced tunneling, demo D5, Lab 3B |
| 3.3 Design checkpoint 3 | 15:15–16:00 | 3.3-01 – 3.3-02 | Design Pack bagian 5–6 |

---

## Topik 3.0 – Recap Hari 2 (09:00–09:15)

#### Slide 3.0-01 · Kuis recap hari 2
- **Tipe:** Quiz
- **Waktu:** 10 menit
- **Pointers:**
  1. Apa dasar pemisahan management group?
  2. Sebutkan 3 policy baseline saat migrasi.
  3. Apa beda Audit dan Deny?
  4. Tag apa yang dipakai untuk showback biaya?
  5. Apa arti huruf R dan A dalam RACI?
- **Ilustrasi:** Ikon jam.
- **Speaker notes (jawaban):** 1) Perbedaan aturan, bukan struktur organisasi. 2) Larang public exposure tak terkelola, wajib diagnostic settings, allowed locations. 3) Audit mencatat non-compliant; Deny menolak deployment. 4) Contoh `CostCenter`. 5) Responsible (mengerjakan), Accountable (penanggung jawab akhir).

---

## Topik 3.1 – Hybrid Identity + Lab 3A + Lab 3C (09:15–12:00)

#### Slide 3.1-01 · Hybrid Identity
- **Tipe:** Judul
- **Waktu:** –
- **Pointers:** Hari 3 · 09:15–12:00 · [ALL] konsep, Build + Operate di lab
- **Ilustrasi:** [Shapes] Ikon server AD (abu-abu) ↔ ikon Entra ID (ungu) dengan panah dua arah.
- **Speaker notes:** –

#### Slide 3.1-02 · Agenda
- **Tipe:** Agenda
- **Waktu:** 1 menit
- **Pointers:** Identitas sebagai perimeter (5’) · Empat keputusan identitas (10’) · Connect Sync vs Cloud Sync (12’) · Metode sign-in (8’) · MFA, Conditional Access, PIM, break-glass (15’) · Demo D4 (10’) · Quiz (5’) · Lab 3A (35’) · Lab 3C (40’)
- **Ilustrasi:** [SmartArt: Vertical Bullet List]
- **Speaker notes:** –

#### Slide 3.1-03 · Tujuan sesi
- **Tipe:** Tujuan
- **Waktu:** 1 menit
- **Pointers:**
  - Menentukan empat keputusan identitas sebelum workload pertama
  - Membandingkan Entra Connect Sync dan Cloud Sync
  - Memilih metode sign-in (PHS, PTA, federation)
  - Menerapkan MFA, Conditional Access, PIM, dan emergency access
  - Menyinkronkan user dari AD on-prem ke Entra ID
- **Ilustrasi:** Ikon target.
- **Speaker notes:** –

#### Slide 3.1-04 · Identitas adalah perimeter baru
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - On-prem: “di dalam jaringan = dipercaya”
  - Cloud: akses dari mana saja → setiap login diverifikasi
  - Akun admin yang bocor = seluruh platform terbuka
- **Ilustrasi:** [Shapes] Kiri: kastil dengan parit (on-prem) dicoret merah. Kanan: banyak perangkat (laptop, ponsel, server) masing-masing melewati “gerbang identitas” ungu sebelum mencapai ikon cloud.
- **Speaker notes:** Hubungkan dengan Zero Trust kemarin.

#### Slide 3.1-05 · Empat keputusan identitas
- **Tipe:** Konten
- **Waktu:** 10 menit
- **Pointers:**
  1. **Akses admin platform:** grup Entra ID, baseline akses tenant, emergency access
  2. **Identitas workload/mesin:** managed identity, service principal, pemilik jelas
  3. **Workload yang bergantung AD lama:** Kerberos, LDAP, Group Policy → perlu DC di Azure?
  4. **Workload cloud-native:** tidak perlu sinkronisasi sebagai syarat migrasi
- **Ilustrasi:** [SmartArt: Basic Matrix] 4 kuadran dengan ikon: mahkota (admin), roda gigi (workload), server lama (AD), awan (cloud-native).
- **Speaker notes:** Sumber: Microsoft Learn “Azure landing zones for on-premises experts – Hybrid identity”. Jika workload pertama butuh user tersinkron atau autentikasi AD lama, buktikan jalur tersebut **sebelum** migrasi.

#### Slide 3.1-06 · Entra Connect Sync vs Cloud Sync
- **Tipe:** Konten
- **Waktu:** 8 menit
- **Pointers:** (tabel)
- **Ilustrasi:** [Tabel] Fitur · Connect Sync · Cloud Sync
  - Lokasi konfigurasi · server on-prem · cloud (Entra admin center)
  - High availability · satu server aktif · beberapa agent aktif
  - Disconnected forests · tidak · **ya**
  - Batas objek per domain · praktis tanpa batas · ±150.000
  - Grup besar · 250.000 anggota · 50.000 anggota
  - Arah fitur baru · – · fokus Microsoft
- **Speaker notes:** Sumber: decision guide Connect Sync → Cloud Sync. Untuk Pertamina: cek jumlah objek per domain dan ukuran grup terbesar sebelum memilih.

#### Slide 3.1-07 · Cara kerja Cloud Sync
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - Agent ringan di server domain-joined (boleh di DC)
  - Hanya **outbound HTTPS 443** ke Entra ID – tanpa VPN
  - Disarankan 3 agent aktif untuk HA
  - Konfigurasi dan monitoring dari cloud
- **Ilustrasi:** [Shapes] Kotak abu-abu “Data center on-prem” berisi DC + ikon agent. Panah hijau tebal keluar berlabel “HTTPS 443 outbound” ke ikon Entra ID (ungu) di awan. Tidak ada garis VPN (beri catatan “tanpa VPN”).
- **Speaker notes:** Poin ini dibuktikan di Lab 3C: DC01 tim hanya keluar ke internet melalui RTR01.

#### Slide 3.1-08 · Metode sign-in
- **Tipe:** Konten
- **Waktu:** 8 menit
- **Pointers:**
  - **Password Hash Sync (PHS):** hash dari hash password disinkron; login tetap jalan saat on-prem down
  - **Pass-through Authentication (PTA):** validasi password di DC on-prem melalui agent
  - **Federation (AD FS):** login dialihkan ke infrastruktur federasi
  - Rekomendasi umum: **PHS sebagai baseline**
- **Ilustrasi:** [Shapes] Tiga jalur login dari ikon user ke Entra ID: PHS (langsung, hijau), PTA (melalui agent ke DC, kuning), Federation (melalui server AD FS, oranye). Di bawah tiap jalur: “ketergantungan pada on-prem: rendah / sedang / tinggi”.
- **Speaker notes:** PHS juga memungkinkan deteksi leaked credentials.

#### Slide 3.1-09 · MFA dan Conditional Access
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Conditional Access: **jika** (user, aplikasi, lokasi, perangkat, risiko) **maka** (izinkan, wajib MFA, blokir)
  - Mulai dengan mode **report-only**
  - Wajib MFA untuk semua admin
- **Ilustrasi:** [Shapes] Diagram “IF → THEN”: kotak sinyal di kiri (ikon user, aplikasi, peta, laptop, grafik risiko) → kotak keputusan berlian “Policy” → tiga hasil di kanan (centang hijau, kunci MFA, tanda larangan merah).
- **Speaker notes:** Policy Conditional Access yang salah bisa mengunci semua orang. Itulah alasan report-only dan akun break-glass.

#### Slide 3.1-10 · Privileged Identity Management (PIM)
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Role **eligible** → diaktifkan saat dibutuhkan (just-in-time)
  - Durasi terbatas, justification, approval opsional
  - Jejak audit lengkap
  - Berlaku untuk role Entra ID, role Azure resource, dan grup
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/entra/id-governance/privileged-identity-management/media/pim-configure/role-activation.png`
- **Speaker notes:** “Tidak ada lagi admin permanen.”

#### Slide 3.1-11 · Emergency access (break-glass)
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:** Minimal 2 akun cloud-only · Dikecualikan dari Conditional Access · Password panjang, disimpan terpisah · Setiap pemakaian memicu alert
- **Ilustrasi:** [Shapes] Kotak kaca “Break glass in case of emergency” berisi ikon kunci; alarm merah di sampingnya.
- **Speaker notes:** Uji akun ini secara berkala, dan pastikan pemakaiannya terpantau.

#### Slide 3.1-12 · Demo D4: Aktivasi role melalui PIM
- **Tipe:** Demo (tujuan)
- **Waktu:** 1 menit
- **Pointers:**
  - **Tujuan:** menunjukkan alur eligible → request → approval → active → audit
  - **Prasyarat:** akun demo dengan role eligible “Network Contributor” di RG demo; akun approver kedua
- **Ilustrasi:** Ikon kunci + jam.
- **Speaker notes:** –

#### Slide 3.1-13 · Demo D4: Tata cara dan sintaks verifikasi
- **Tipe:** Demo (langkah + sintaks)
- **Waktu:** 8 menit
- **Pointers:**
  1. Entra admin center → Identity Governance → **Privileged Identity Management** → **My roles** → Azure resources → role **Eligible**
  2. **Activate** → isi justification dan durasi (1 jam)
  3. Akun approver → PIM → **Approve requests** → Approve
  4. Akun demo → role menjadi **Active** dengan waktu kedaluwarsa → **My audit history**
  ```bash
  # Verifikasi role aktif (jalankan sebagai akun demo setelah sign in ulang)
  az role assignment list --assignee <upn-demo> --all \
    --query "[].{Role:roleDefinitionName, Scope:scope}" -o table
  ```
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/entra/id-governance/privileged-identity-management/media/pim-resource-roles-activate-your-roles/resources-my-roles.png`
- **Speaker notes:** Aktivasi bisa butuh beberapa menit sampai berlaku; sign out/in jika role belum terlihat.

#### Slide 3.1-14 · Demo D4: Hasil yang diharapkan
- **Tipe:** Demo (hasil)
- **Waktu:** 1 menit
- **Pointers:** Status role: Eligible → Active (dengan end time) · CLI menampilkan “Network Contributor” pada scope RG demo · Audit history mencatat siapa, kapan, alasan, approver
- **Ilustrasi:** [Shapes] Garis waktu: “09:40 Request” → “09:42 Approved” → “09:42–10:42 Active” → “Expired”.
- **Speaker notes:** –

#### Slide 3.1-15 · Demo D4: Ilustrasi cadangan
- **Tipe:** Demo (fallback)
- **Waktu:** –
- **Pointers:** Di mana hasilnya terlihat
- **Ilustrasi:** [Mockup portal] Breadcrumb `Home > Privileged Identity Management > My roles`. Menu kiri: “Microsoft Entra roles / Groups / Azure resources” (Azure resources ter-highlight). Tab “Eligible assignments | Active assignments | Expired”. Tabel satu baris: “Network Contributor | rg-demo | Activate”. Callout ungu ke tombol **Activate**: “Isi alasan dan durasi”. Panel kedua kecil: tab “Active assignments” menampilkan baris yang sama dengan kolom “End time 10:42”.
- **Speaker notes:** Pakai jika portal tidak tersedia.

#### Slide 3.1-16 · Quiz topik 3.1
- **Tipe:** Quiz
- **Waktu:** 5 menit
- **Pointers:**
  1. Fitur Cloud Sync yang tidak dimiliki Connect Sync adalah… A. Sinkronisasi user B. Disconnected forests dan beberapa agent aktif C. Password hash sync D. Group sync
  2. Koneksi yang dibutuhkan agent Cloud Sync ke Entra ID adalah… A. VPN site-to-site B. ExpressRoute C. Outbound HTTPS 443 D. Inbound RDP
  3. Metode sign-in yang tetap berfungsi saat seluruh on-prem down adalah… A. Pass-through Authentication B. Federation C. Password Hash Sync D. Kerberos
  4. Mode Conditional Access yang aman untuk uji coba adalah… A. On B. Report-only C. Off D. Block all
  5. Akun break-glass sebaiknya… A. Disinkron dari AD B. Cloud-only dan dikecualikan dari Conditional Access C. Dipakai sehari-hari D. Tanpa password
- **Ilustrasi:** Ikon tanda tanya.
- **Speaker notes (jawaban):** 1-B. 2-C. 3-C (PHS tidak bergantung pada agent/DC on-prem saat login). 4-B. 5-B.

#### Slide 3.1-17 · Lab 3A: Identity and privileged access
- **Tipe:** Lab
- **Waktu:** 35 menit (10:45–11:20)
- **Pointers:**
  - **Build (TECH):** aktifkan role Role Based Access Control Administrator via PIM (approval manager); beri Reader ke grup auditor tim; team lead mengaktifkan Conditional Access Administrator + **Hybrid Identity Administrator** dan membuat Conditional Access policy **report-only**
  - **Operate (EXEC/ANL):** baca sign-in logs; manager menyetujui PIM request engineer tim
  - **Kriteria sukses:** semua team lead aktif sebagai Hybrid Identity Administrator pada menit ke-30
- **Ilustrasi:** [Shapes] Alur: Engineer → “Request role” → Manager “Approve” → Role aktif (centang) → panah ke “Lab 3C”.
- **Speaker notes:** Conditional Access **wajib** report-only. Tanpa role aktif, Lab 3C tidak bisa berjalan.

#### Slide 3.1-18 · Lab 3C: Hybrid identity sync (on-prem + Azure)
- **Tipe:** Lab
- **Waktu:** 40 menit (11:20–12:00)
- **Pointers:**
  - **Build:** install Cloud Sync agent di DC01 → buat configuration untuk domain `teamN.corp.local`, scope OU `Sync-Users`, password hash sync aktif → **Provision on demand** satu user → login ke portal dengan user tersebut
  - **Operate:** cek status agent dan provisioning logs; catat jumlah user tersinkron dan error
  - **Kriteria sukses:** empat centang hijau di provision on demand; login berhasil
- **Ilustrasi:** [Shapes] Arsitektur lab: kotak abu-abu “Data center tim N (172.16.N.0/24)” berisi DC01 (ikon agent) dan RTR01 (ikon router/internet edge). Panah hijau dari DC01 → RTR01 → internet → Entra ID (ungu) berlabel “HTTPS 443”. Catatan merah kecil: “Tidak memakai VPN”.
- **Speaker notes:** Ini lab hybrid pertama. Tekankan bahwa jalurnya hanya outbound HTTPS.

#### Slide 3.1-19 · Lab 3C: Sintaks persiapan di DC01
- **Tipe:** Lab (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```powershell
  # Jalankan di DC01 (PowerShell sebagai Administrator)
  Get-KdsRootKey                                  # harus ada (dibuat oleh script setup)
  Test-NetConnection login.microsoftonline.com -Port 443   # TcpTestSucceeded : True

  # Daftar user yang akan disinkron dan distinguished name-nya
  Get-ADUser -Filter * -SearchBase "OU=Sync-Users,DC=team1,DC=corp,DC=local" |
    Select-Object Name, DistinguishedName

  # Jalankan installer agent (sudah diunduh trainer)
  Start-Process "C:\LabFiles\AADConnectProvisioningAgentSetup.exe"
  ```
- **Ilustrasi:** Latar gelap.
- **Speaker notes:** Jika KDS root key kosong: `Add-KdsRootKey -EffectiveTime ((Get-Date).AddHours(-10))`.

#### Slide 3.1-20 · Lab 3C: Langkah konfigurasi di Entra admin center
- **Tipe:** Lab (langkah)
- **Waktu:** –
- **Pointers:**
  1. Entra admin center → **Entra ID → Entra Connect → Cloud sync**
  2. **New configuration** → pilih domain `teamN.corp.local`
  3. Scoping filter: OU `Sync-Users`; pastikan **password hash sync** aktif → Enable
  4. **Provision on demand** → masukkan DN, contoh `CN=Budi Santoso,OU=Sync-Users,DC=team1,DC=corp,DC=local` → Provision
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/entra/includes/media/cloud-sync-sign-in/cloud-sync-configurations.png`
- **Speaker notes:** Provision on demand mengabaikan scoping filter; berguna untuk tes, tetapi bukan bukti scoping sudah benar.

#### Slide 3.1-21 · Lab 3C: Hasil yang diharapkan
- **Tipe:** Lab (hasil)
- **Waktu:** –
- **Pointers:**
  - Empat centang hijau pada provision on demand
  - User muncul di Entra ID dengan UPN `nama@<tenant>.onmicrosoft.com`
  - Agent berstatus **Healthy**
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/entra/identity/hybrid/cloud-sync/media/how-to-on-demand-provision/new-ux-3.png`
- **Speaker notes:** Teaching point: domain `.local` tidak bisa diverifikasi, sehingga UPN memakai onmicrosoft.com. Di Pertamina, tambahkan UPN suffix routable yang terverifikasi sebelum sinkronisasi. Semua tim memakai satu tenant dengan forest berbeda – contoh nyata **disconnected forests**.

#### Slide 3.1-22 · Lab 3C: Ilustrasi cadangan
- **Tipe:** Lab (fallback)
- **Waktu:** –
- **Pointers:** Di mana hasil sinkronisasi terlihat
- **Ilustrasi:** [Mockup portal] Breadcrumb `Entra ID > Entra Connect > Cloud sync`. Tabel “Configurations”: baris “team1.corp.local | Healthy | Agents: 1”. Panel kanan “Provision on demand” dengan 4 langkah bercentang hijau: “Import user · Determine if user is in scope · Match user between source and target · Perform action”. Callout ungu ke langkah 4: “User dibuat di Entra ID”.
- **Speaker notes:** Lab assistant juga bisa menunjukkan hasil dari lingkungan golden team.

#### Slide 3.1-23 · Lab 3A/3C: Masalah umum
- **Tipe:** Lab (troubleshooting)
- **Waktu:** –
- **Pointers:** (tabel)
- **Ilustrasi:** [Tabel] Gejala · Solusi
  - Role aktif tetapi akses ditolak · sign out, tutup browser, sign in ulang
  - Installer gagal membuat gMSA · cek/buat KDS root key
  - Wizard menolak akun · Hybrid Identity Administrator belum aktif atau akun guest
  - Agent unhealthy · outbound 443 dari DC01 terblokir (cek RTR01)
  - User tersinkron tetapi tidak bisa login · password hash sync belum jalan
- **Speaker notes:** Tampilkan selama lab; lab assistant memakai tabel yang sama.

#### Slide 3.1-24 · Summary topik 3.1
- **Tipe:** Summary
- **Waktu:** 2 menit
- **Pointers:**
  - Empat keputusan identitas sebelum workload pertama
  - Cloud Sync: agent ringan, outbound HTTPS, multi-forest
  - PHS sebagai baseline sign-in
  - Conditional Access report-only dulu; PIM untuk semua admin
  - Break-glass: cloud-only, dipantau
- **Ilustrasi:** Ikon centang.
- **Speaker notes:** Transisi: “Identitas sudah terhubung tanpa VPN. Sekarang kita siapkan jaringannya.”

---

## Topik 3.2 – Network Topology + Lab 3B (13:00–15:00)

#### Slide 3.2-01 · Network Topology
- **Tipe:** Judul
- **Waktu:** –
- **Pointers:** Hari 3 · 13:00–15:00 · [ALL] konsep, Build + Operate di lab
- **Ilustrasi:** Ikon hub dengan jari-jari.
- **Speaker notes:** –

#### Slide 3.2-02 · Agenda
- **Tipe:** Agenda
- **Waktu:** 1 menit
- **Pointers:** Pemetaan jaringan on-prem → Azure (5’) · Hub-and-spoke vs Virtual WAN (10’) · IP plan (8’) · NSG, firewall, UDR (8’) · Ingress, egress, Private Link (10’) · Forced tunneling dan default outbound (5’) · Demo D5 (8’) · Quiz (5’) · Lab 3B (60’)
- **Ilustrasi:** [SmartArt: Vertical Bullet List]
- **Speaker notes:** –

#### Slide 3.2-03 · Tujuan sesi
- **Tipe:** Tujuan
- **Waktu:** 1 menit
- **Pointers:**
  - Memilih topologi: hub-and-spoke atau Virtual WAN
  - Menyusun IP plan yang tidak bentrok dengan on-prem
  - Membedakan NSG, Azure Firewall, dan UDR
  - Menjelaskan pola ingress, egress, dan Private Link
  - Memverifikasi routing dengan Network Watcher
- **Ilustrasi:** Ikon target.
- **Speaker notes:** –

#### Slide 3.2-04 · Dari jaringan fisik ke software-defined network
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:** (tabel)
- **Ilustrasi:** [Tabel] On-premises · Azure
  - Segmen jaringan · Virtual network
  - VLAN · Subnet
  - ACL switch · NSG
  - Firewall fisik · Azure Firewall / NVA di hub
  - Static route · UDR
  - OSPF/BGP internal · ditangani Azure; BGP hanya untuk VPN/ExpressRoute
- **Speaker notes:** Spanning tree, trunk, dan kabel tidak lagi menjadi urusan tim. Yang tersisa adalah desain alamat, routing, dan kontrol akses.

#### Slide 3.2-05 · Topologi hub-and-spoke
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - **Hub:** layanan bersama – firewall, VPN/ExpressRoute gateway, Bastion, DNS
  - **Spoke:** satu per workload/subscription, di-peer ke hub
  - Trafik spoke ↔ spoke dan spoke ↔ on-prem melalui hub
  - Satu hub per region
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/architecture/networking/architecture/_images/hub-spoke-network-topology-architecture.svg`
- **Speaker notes:** Topologi yang direkomendasikan CAF untuk sebagian besar organisasi.

#### Slide 3.2-06 · Hub-and-spoke vs Virtual WAN
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:** (tabel)
- **Ilustrasi:** [Tabel] Kriteria · Hub-and-spoke (dikelola sendiri) · Virtual WAN (dikelola Microsoft)
  - Kontrol · penuh · lebih sedikit
  - Banyak cabang/region · perlu kerja manual · native
  - NVA pihak ketiga · fleksibel · terbatas
  - Overhead operasional · lebih tinggi · lebih rendah
  - Cocok untuk · sebagian besar enterprise · banyak site global
- **Speaker notes:** [MS Learn] referensi Virtual WAN: `https://learn.microsoft.com/azure/architecture/networking/architecture/_images/hub-spoke-virtual-wan-architecture-1.svg` dapat ditampilkan sebagai backup slide.

#### Slide 3.2-07 · IP plan: keputusan paling mahal jika salah
- **Tipe:** Konten
- **Waktu:** 8 menit
- **Pointers:**
  - Address space Azure **tidak boleh** bentrok dengan on-prem, cabang, mitra
  - Minta blok khusus dari tim network (contoh: satu /16 untuk Azure)
  - Rencanakan 3–5 tahun ke depan
  - Lab: Azure `10.0.0.0/16`, on-prem tim N `172.16.N.0/24`
- **Ilustrasi:** [Shapes] Bar horizontal panjang “10.0.0.0/16 – Azure Indonesia Central” dibagi blok: “Hub 10.0.0.0/22”, “Spoke tim 1 10.0.11.0/24”, “Spoke tim 2 10.0.12.0/24”, “…cadangan”. Di bawahnya bar abu-abu “172.16.0.0/16 – On-prem (simulasi)”. Ikon centang “tidak tumpang tindih”.
- **Speaker notes:** Ingat studi kasus hari 1: proyek A bentrok dengan jaringan kilang.

#### Slide 3.2-08 · NSG, Azure Firewall, dan UDR
- **Tipe:** Konten
- **Waktu:** 8 menit
- **Pointers:**
  - **NSG:** filter L3/L4 stateful di subnet/NIC
  - **Azure Firewall:** inspeksi terpusat, FQDN filtering, threat intelligence
  - **UDR:** mengarahkan trafik (contoh 0.0.0.0/0 → firewall)
  - Dipakai bersama, bukan pilih salah satu
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/architecture/networking/architecture/_images/spoke-spoke-routing.svg`
- **Speaker notes:** Gambar menunjukkan trafik spoke ke spoke diarahkan ke firewall di hub melalui UDR.

#### Slide 3.2-09 · Pola ingress dan egress yang disetujui
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - **Ingress:** Application Gateway (WAF) · Front Door · Firewall DNAT · Load Balancer · Bastion (admin)
  - **Egress:** Azure Firewall · NAT Gateway · UDR ke hub · Firewall Premium (TLS inspection)
  - Setiap public endpoint: pemilik, jalur inspeksi, review
- **Ilustrasi:** [Shapes] Spoke di tengah. Panah masuk (biru) dari internet melalui kotak “App Gateway/Front Door”. Panah keluar (oranye) melalui “Azure Firewall” ke internet. Ikon Bastion terpisah untuk admin.
- **Speaker notes:** Sumber: Microsoft Learn – platform-level network security design.

#### Slide 3.2-10 · Private Link dan private endpoint
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:** PaaS (storage, SQL) diakses lewat IP privat · Trafik tetap di backbone Microsoft · Membutuhkan DNS yang benar (hari 4)
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/architecture/networking/guide/images/private-link-hub-spoke-network-basic-hub-spoke-diagram.svg`
- **Speaker notes:** Private endpoint tanpa DNS yang benar = aplikasi tetap pergi ke IP publik. Ini akan dibuktikan besok.

#### Slide 3.2-11 · Forced tunneling dan default outbound access
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Forced tunneling (internet lewat on-prem) umumnya **antipattern**: latensi + ketergantungan
  - Pakai hanya jika ada kewajiban compliance
  - VNet baru setelah 30 September 2025: **tidak ada akses internet implisit** → wajib metode egress eksplisit
  - Di lab: RTR01 = internet edge on-prem
- **Ilustrasi:** [Shapes] Dua jalur dari VM Azure ke internet: (1) langsung lewat Azure Firewall (hijau, “disarankan”); (2) memutar lewat VPN ke on-prem lalu ke internet (merah putus-putus, “latensi + titik gagal tunggal”).
- **Speaker notes:** Keputusan internet breakout dicatat di Design Pack.

#### Slide 3.2-12 · Jaringan OT tetap terpisah
- **Tipe:** Konten
- **Waktu:** 3 menit
- **Pointers:** OT tidak di-peer ke landing zone · Data OT keluar melalui DMZ terkontrol · Arah aliran satu arah jika memungkinkan
- **Ilustrasi:** [Shapes] Tiga zona: “OT (SCADA/DCS)” merah – “DMZ / historian” kuning – “IT + Azure” biru. Panah satu arah dari OT ke DMZ ke IT; tanda larangan pada panah langsung OT ↔ Azure.
- **Speaker notes:** Sesuaikan dengan arsitektur OT Pertamina; jangan menjanjikan konektivitas OT ke cloud tanpa kajian keamanan OT.

#### Slide 3.2-13 · Demo D5: Effective routes dan Next hop
- **Tipe:** Demo (tujuan)
- **Waktu:** 1 menit
- **Pointers:**
  - **Tujuan:** membuktikan trafik spoke keluar melalui Azure Firewall
  - **Prasyarat:** VM di spoke demo; subnet memiliki UDR 0.0.0.0/0 ke IP privat firewall; Network Watcher aktif di region
- **Ilustrasi:** Ikon kompas.
- **Speaker notes:** –

#### Slide 3.2-14 · Demo D5: Sintaks
- **Tipe:** Demo (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```bash
  # 1. Route yang benar-benar berlaku di NIC VM
  az network nic show-effective-route-table \
    -g rg-spoke-demo -n nic-vm-demo -o table

  # 2. Next hop ke internet
  az network watcher show-next-hop -g rg-spoke-demo --vm vm-demo \
    --source-ip 10.0.10.4 --dest-ip 8.8.8.8

  # 3. Next hop ke spoke lain
  az network watcher show-next-hop -g rg-spoke-demo --vm vm-demo \
    --source-ip 10.0.10.4 --dest-ip 10.0.20.4
  ```
- **Ilustrasi:** Latar gelap.
- **Speaker notes:** Ganti IP sesuai lingkungan demo.

#### Slide 3.2-15 · Demo D5: Tata cara dan hasil
- **Tipe:** Demo (langkah + hasil)
- **Waktu:** 7 menit
- **Pointers:**
  1. Portal → NIC VM → **Effective routes**: route default, route peering (VNetPeering), UDR (User) ke IP firewall
  2. Network Watcher → **Next hop** ke 8.8.8.8 → **VirtualAppliance** (IP firewall)
  3. Next hop ke spoke lain → juga **VirtualAppliance**
- **Ilustrasi:** [Tabel] Contoh output effective routes: Source · Address prefix · Next hop type · Next hop IP — “Default · 10.0.10.0/24 · VnetLocal · –”, “Default · 10.0.0.0/22 · VNetPeering · –”, “User · 0.0.0.0/0 · VirtualAppliance · 10.0.1.4”.
- **Speaker notes:** Kalimat inti: “Di Azure, routing bisa dilihat dan diverifikasi tanpa traceroute. Ini alat pertama saat troubleshooting.”

#### Slide 3.2-16 · Demo D5: Ilustrasi cadangan
- **Tipe:** Demo (fallback)
- **Waktu:** –
- **Pointers:** Di mana hasilnya terlihat
- **Ilustrasi:** [Mockup portal] Breadcrumb `Network Watcher > Next hop`. Form: Subscription, Resource group, VM, Source IP `10.0.10.4`, Destination IP `8.8.8.8`, tombol “Next hop”. Hasil di bawah: “Next hop type: VirtualAppliance · IP address: 10.0.1.4 · Route table ID: …/rt-spoke-demo”. Callout hijau berpanah: “Trafik diinspeksi firewall”.
- **Speaker notes:** –

#### Slide 3.2-17 · Quiz topik 3.2
- **Tipe:** Quiz
- **Waktu:** 5 menit
- **Pointers:**
  1. Komponen yang biasanya berada di hub adalah… A. Database aplikasi B. Firewall dan VPN/ExpressRoute gateway C. VM aplikasi D. Storage data pengguna
  2. Padanan VLAN di Azure adalah… A. Resource group B. Subnet C. Tag D. Region
  3. Resource untuk mengarahkan 0.0.0.0/0 ke Azure Firewall adalah… A. NSG B. User-defined route (UDR) C. Azure Policy D. Private DNS zone
  4. Mengapa forced tunneling umumnya dihindari? A. Lebih murah B. Menambah latensi dan ketergantungan pada link on-prem C. Tidak didukung Azure D. Mempercepat internet
  5. Hal pertama yang wajib dipastikan dalam IP plan Azure adalah… A. Memakai 192.168.0.0/16 B. Tidak tumpang tindih dengan jaringan on-prem dan mitra C. Satu subnet untuk semua D. Memakai IP publik
- **Ilustrasi:** Ikon tanda tanya.
- **Speaker notes (jawaban):** 1-B. 2-B. 3-B. 4-B. 5-B.

#### Slide 3.2-18 · Lab 3B: Hub-and-spoke
- **Tipe:** Lab
- **Waktu:** 60 menit (14:00–15:00)
- **Pointers:**
  - **Build (TECH):** peering spoke ↔ hub (sisi spoke dengan *use remote gateways*); route table 0.0.0.0/0 ke IP Azure Firewall; verifikasi dengan Next hop
  - **Operate (EXEC/ANL):** buka topology di Network Watcher; baca firewall logs dengan query yang disediakan
  - **Kriteria sukses:** peering **Connected**; next hop ke internet = VirtualAppliance
- **Ilustrasi:** [Shapes] Hub di tengah (biru tua, ikon firewall + gateway), spoke tim di kanan. Panah peering dua arah; panah oranye dari spoke ke firewall berlabel “UDR 0.0.0.0/0”. Tanda “Besok: VPN ke on-prem” di sisi kiri hub.
- **Speaker notes:** Tim membuat kedua sisi peering setelah mengaktifkan Network Contributor di rg-conn melalui PIM; trainer menyiapkan script cadangan. *Use remote gateways* wajib agar besok spoke bisa menjangkau on-prem.

#### Slide 3.2-19 · Lab 3B: Sintaks (Build)
- **Tipe:** Lab (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```bash
  N=1   # nomor tim
  az network vnet peering create -g rg-spoke-team$N -n spoke-to-hub \
    --vnet-name vnet-spoke-team$N --remote-vnet <hub-vnet-resource-id> \
    --allow-vnet-access --allow-forwarded-traffic --use-remote-gateways

  az network route-table create -g rg-spoke-team$N -n rt-spoke-team$N
  az network route-table route create -g rg-spoke-team$N \
    --route-table-name rt-spoke-team$N -n default-to-fw \
    --address-prefix 0.0.0.0/0 --next-hop-type VirtualAppliance \
    --next-hop-ip-address <fw-private-ip>
  az network vnet subnet update -g rg-spoke-team$N \
    --vnet-name vnet-spoke-team$N -n snet-app --route-table rt-spoke-team$N
  ```
- **Ilustrasi:** Latar gelap.
- **Speaker notes:** Jika peering gagal dengan error gateway transit, sisi hub belum mengizinkan gateway transit – trainer menjalankan script hub.

#### Slide 3.2-20 · Lab 3B: Masalah umum
- **Tipe:** Lab (troubleshooting)
- **Waktu:** –
- **Pointers:** (tabel)
- **Ilustrasi:** [Tabel] Gejala · Solusi
  - Peering status “Initiated” · sisi hub belum dibuat → script trainer
  - Error *use remote gateways* · hub belum *allow gateway transit*
  - VM spoke tidak bisa ke internet · rule Azure Firewall belum mengizinkan → gunakan rule collection lab
  - Next hop masih “Internet” · route table belum di-associate ke subnet
- **Speaker notes:** –

#### Slide 3.2-21 · Summary topik 3.2
- **Tipe:** Summary
- **Waktu:** 2 menit
- **Pointers:**
  - Hub = layanan bersama; spoke = workload
  - IP plan tanpa tumpang tindih, cadangkan untuk 3–5 tahun
  - NSG + Firewall + UDR dipakai bersama
  - Egress eksplisit; forced tunneling hanya jika wajib
  - OT tetap terpisah
- **Ilustrasi:** Ikon centang.
- **Speaker notes:** –

---

## Topik 3.3 – Design Checkpoint 3 (15:15–16:00)

#### Slide 3.3-01 · Design checkpoint 3
- **Tipe:** Lab (workshop)
- **Waktu:** 35 menit
- **Pointers:** Design Pack **bagian 5** (model identitas, akses admin, emergency access) dan **bagian 6** (topologi, IP plan)
  - Pertanyaan pemicu: Aplikasi mana yang masih butuh Kerberos/LDAP? · Siapa pemilik IP plan Azure? · Internet dari Azure keluar lokal atau kembali ke on-prem?
- **Ilustrasi:** Ikon dokumen + pena.
- **Speaker notes:** –

#### Slide 3.3-02 · Recap hari 3 dan preview hari 4
- **Tipe:** Summary
- **Waktu:** 10 menit
- **Pointers:** Hari ini: identitas hybrid (tanpa VPN) dan hub-and-spoke · Besok: **VPN ke data center**, **hybrid DNS**, **Azure Arc** – dua lab hybrid utama
- **Ilustrasi:** [Shapes] Data center tim (abu-abu) dan hub (biru) belum tersambung, dengan garis putus-putus berlabel “Besok: IPsec VPN”.
- **Speaker notes:** Hari 4 adalah hari paling teknis; minta peserta datang tepat waktu.
