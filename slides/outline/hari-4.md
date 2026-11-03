# Hari 4 (Kamis) – Hybrid Connectivity dan Operasi

**Tujuan hari ini:** peserta mampu membandingkan VPN dan ExpressRoute untuk Pertamina, membangun tunnel site-to-site, membuat hybrid DNS bekerja untuk private endpoint, serta mengelola server on-prem dari Azure dengan Azure Arc dan Azure Monitor.

**Audiens:** [TECH] Build; [EXEC]/[ANL] Operate dan latihan keputusan. **Dua lab hybrid utama: Lab 4A dan Lab 4B.** Siapkan 2 lab assistant.

| Topik | Waktu | Slide | Isi |
|---|---|---|---|
| 4.0 Recap hari 3 | 09:00–09:15 | 4.0-01 | Kuis recap |
| 4.1 Koneksi ke on-premises dan hybrid DNS + Lab 4A | 09:15–12:00 | 4.1-01 – 4.1-24 | VPN Gateway, ExpressRoute Jakarta, coexistence, BGP, hybrid DNS, demo D6, Lab 4A |
| 4.2 Operasi lintas dua dunia + Lab 4B | 13:00–15:00 | 4.2-01 – 4.2-22 | Azure Monitor, alert ke ITSM, Azure Arc, Update Manager, backup/DR, keputusan DR, demo D7, Lab 4B |
| 4.3 Design checkpoint 4 | 15:15–16:00 | 4.3-01 – 4.3-02 | Design Pack bagian 7–8 |

---

## Topik 4.0 – Recap Hari 3 (09:00–09:15)

#### Slide 4.0-01 · Kuis recap hari 3
- **Tipe:** Quiz
- **Waktu:** 10 menit
- **Pointers:**
  1. Koneksi apa yang dibutuhkan agent Cloud Sync?
  2. Mengapa domain `.local` membuat UPN user menjadi onmicrosoft.com?
  3. Apa fungsi *use remote gateways* pada peering spoke?
  4. Next hop type apa yang menandakan trafik melewati firewall?
  5. Mengapa IP plan Azure tidak boleh bentrok dengan on-prem?
- **Ilustrasi:** Ikon jam.
- **Speaker notes (jawaban):** 1) Outbound HTTPS 443. 2) Domain `.local` tidak bisa diverifikasi di Entra ID. 3) Spoke memakai VPN/ExpressRoute gateway milik hub untuk menjangkau on-prem. 4) VirtualAppliance. 5) Routing menjadi ambigu dan koneksi hybrid gagal.

---

## Topik 4.1 – Koneksi ke On-Premises dan Hybrid DNS + Lab 4A (09:15–12:00)

#### Slide 4.1-01 · Koneksi ke On-Premises dan Hybrid DNS
- **Tipe:** Judul
- **Waktu:** –
- **Pointers:** Hari 4 · 09:15–12:00 · [ALL] konsep, Build + Operate di lab
- **Ilustrasi:** [Shapes] Data center abu-abu dan awan biru dihubungkan dua garis: hijau tebal “ExpressRoute” dan biru putus-putus “VPN”.
- **Speaker notes:** –

#### Slide 4.1-02 · Agenda
- **Tipe:** Agenda
- **Waktu:** 1 menit
- **Pointers:** VPN Gateway (12’) · ExpressRoute dan Jakarta (12’) · Coexistence dan routing (8’) · Hybrid DNS (20’) · Demo D6 (10’) · Quiz (5’) · Lab 4A (75’)
- **Ilustrasi:** [SmartArt: Vertical Bullet List]
- **Speaker notes:** –

#### Slide 4.1-03 · Tujuan sesi
- **Tipe:** Tujuan
- **Waktu:** 1 menit
- **Pointers:**
  - Memilih VPN atau ExpressRoute berdasarkan throughput, latensi, compliance, dan waktu
  - Menjelaskan opsi ExpressRoute di Jakarta
  - Merancang VPN sebagai failover ExpressRoute
  - Menjelaskan alur hybrid DNS untuk private endpoint
  - Membangun tunnel site-to-site dan membuktikan DNS bekerja
- **Ilustrasi:** Ikon target.
- **Speaker notes:** –

#### Slide 4.1-04 · Konektivitas hybrid: pemblokir semua workload
- **Tipe:** Konten
- **Waktu:** 3 menit
- **Pointers:**
  - Management group dan policy bisa diperbaiki setelah migrasi
  - Konektivitas yang tidak stabil **menghentikan semua workload sekaligus**
  - Putuskan sebelum workload pertama: jalur, routing, DNS, inspeksi
- **Ilustrasi:** [Shapes] Jembatan antara data center dan awan; di tengah jembatan tanda “Under construction” dengan antrean ikon aplikasi menunggu.
- **Speaker notes:** Sumber: Microsoft Learn “Azure landing zones for on-premises experts – Hub network and hybrid connectivity”.

#### Slide 4.1-05 · Site-to-site VPN
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - Tunnel IPsec/IKE melalui internet, terenkripsi
  - Butuh perangkat VPN on-prem dengan IP publik
  - Satu gateway bisa melayani banyak site (route-based)
  - Jalur tercepat untuk mendapatkan konektivitas
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/vpn-gateway/media/tutorial-site-to-site-portal/diagram.png`
- **Speaker notes:** Komponen di Azure: VPN gateway (di GatewaySubnet), Local Network Gateway (mewakili site on-prem), Connection.

#### Slide 4.1-06 · Memilih SKU VPN Gateway
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - **Basic:** ±100 Mbps, tanpa BGP, tanpa active-active → tidak untuk produksi
  - Pilih SKU berakhiran **AZ** (zone-redundant)
  - **Active-active** untuk HA dan throughput lebih tinggi
  - Pembuatan gateway: **45 menit atau lebih**
- **Ilustrasi:** [Shapes] Tangga tiga anak tangga: “Basic (lab/uji)” abu-abu dengan tanda X merah untuk produksi → “VpnGw1AZ–2AZ” biru → “VpnGw3AZ+ active-active” biru tua. Ikon jam pasir berlabel “45+ menit”.
- **Speaker notes:** Karena butuh 45+ menit, VPN gateway lab sudah dibuat trainer sebelumnya. Peserta hanya membuat koneksi.

#### Slide 4.1-07 · ExpressRoute
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Koneksi privat melalui provider, **tidak lewat internet**
  - Bandwidth dan latensi lebih dapat diprediksi
  - Circuit dengan dua koneksi (primary/secondary) di peering location
  - ExpressRoute gateway di hub (SKU AZ)
- **Ilustrasi:** [Shapes] Kiri: data center Pertamina → kotak “Provider (mis. Telin / XL Axiata)” → “Peering location Jakarta” → “Microsoft edge” → hub Azure. Dua garis paralel antara provider dan Microsoft edge berlabel “primary / secondary”.
- **Speaker notes:** –

#### Slide 4.1-08 · ExpressRoute di Jakarta
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Peering location **Jakarta** (NeutraDC HDC) dan **Jakarta2** (NTT GDC Indonesia), lokal untuk Indonesia Central
  - **ExpressRoute Metro** di Jakarta
  - Provider: Telin · XL Axiata · DCI Indonesia · NTT Indonesia · DE-CIX · Equinix · Zenlayer
  - **Lead time: minggu sampai bulan**
- **Ilustrasi:** [Tabel] Lokasi · Data center · Provider (ringkas). Sumber: halaman ExpressRoute peering locations di Microsoft Learn.
- **Speaker notes:** Periksa ulang daftar provider sebelum delivery. Tanyakan apakah provider WAN Pertamina saat ini ada di daftar.

#### Slide 4.1-09 · VPN sebagai failover ExpressRoute
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - ExpressRoute = jalur utama; VPN = cadangan
  - Butuh dua gateway di hub (tipe ExpressRoute dan VPN); GatewaySubnet /26 untuk coexistence
  - Atur **local preference** on-prem agar memilih ExpressRoute (hindari asymmetric routing)
  - Jalankan VPN dulu selama ExpressRoute dipesan
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/architecture/reference-architectures/hybrid-networking/images/expressroute-connectivity-with-vpn-backup.svg`
- **Speaker notes:** Untuk workload sangat kritikal, Microsoft menyarankan dua circuit di peering location berbeda, bukan hanya VPN sebagai cadangan.

#### Slide 4.1-10 · Routing dan kepemilikan
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - Tentukan pemilik **BGP advertisement** dan summarization
  - Waspadai **asymmetric routing** jika ada inspeksi firewall dan dua jalur
  - Azure memilih prefix terpanjang (longest prefix match)
  - Dokumentasikan jalur inspeksi north-south dan east-west
- **Ilustrasi:** [Shapes] Paket data pergi lewat ExpressRoute (hijau) tetapi kembali lewat VPN (merah) dengan firewall di tengah yang memberi tanda X: “Asymmetric = di-drop”.
- **Speaker notes:** –

#### Slide 4.1-11 · Hybrid DNS: masalah yang paling sering
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Private endpoint punya IP privat, tetapi nama layanan tetap publik (`*.blob.core.windows.net`)
  - Tanpa DNS yang benar → klien mendapat **IP publik** → ditolak
  - DNS on-prem harus bisa me-resolve zona `privatelink`, dan Azure harus bisa me-resolve domain on-prem
- **Ilustrasi:** [Shapes] Server on-prem bertanya “st…blob.core.windows.net?” ke DNS on-prem; jawaban “20.x.x.x (publik)” dengan panah merah ke internet dan tanda X; di bawahnya jawaban yang benar “10.0.x.x (privat)” dengan panah hijau melalui VPN.
- **Speaker notes:** “Konektivitas jaringan saja tidak cukup.”

#### Slide 4.1-12 · Azure DNS Private Resolver
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - **Inbound endpoint:** IP target conditional forwarder dari DNS on-prem
  - **Outbound endpoint + forwarding ruleset:** Azure meneruskan domain on-prem ke DNS on-prem
  - Layanan terkelola, zone-aware – menggantikan VM DNS forwarder
  - Masing-masing butuh subnet khusus
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/networking/design-guide/media/dns-hybrid-resolution-flow.png`
- **Speaker notes:** –

#### Slide 4.1-13 · Alur DNS dari on-prem ke private endpoint
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  1. Aplikasi on-prem → DNS on-prem (DC01)
  2. Conditional forwarder `blob.core.windows.net` → inbound endpoint resolver
  3. Azure DNS → Private DNS zone `privatelink.blob.core.windows.net` (ter-link ke hub)
  4. Jawaban: IP private endpoint `10.0.x.x`
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/private-link/media/private-endpoint-dns/on-premises-forwarding-to-azure.png`
- **Speaker notes:** Forward zona **publik** (`blob.core.windows.net`), bukan zona `privatelink.` – ini kesalahan klasik.

#### Slide 4.1-14 · Kesalahan hybrid DNS yang paling umum
- **Tipe:** Konten
- **Waktu:** 3 menit
- **Pointers:**
  - DNS on-prem diarahkan langsung ke `168.63.129.16` (tidak terjangkau dari luar VNet)
  - Ruleset ter-link ke VNet yang salah
  - Upstream memberi jawaban referral, bukan rekursif
  - MTU/fragmentasi di jalur VPN memotong jawaban DNS besar
- **Ilustrasi:** [SmartArt: Vertical Box List] 4 kotak merah dengan ikon peringatan.
- **Speaker notes:** Sumber: Microsoft Learn troubleshooting hybrid DNS. Kesalahan pertama dipakai di game day hari 5.

#### Slide 4.1-15 · Demo D6: Hybrid DNS end-to-end
- **Tipe:** Demo (tujuan)
- **Waktu:** 1 menit
- **Pointers:**
  - **Tujuan:** membuktikan resolusi nama berubah dari IP publik ke IP privat setelah conditional forwarder dibuat, dan Azure bisa me-resolve domain on-prem
  - **Prasyarat:** lingkungan golden team (team0) dengan VPN tersambung; storage account dengan private endpoint; IP inbound endpoint resolver
- **Ilustrasi:** Ikon kaca pembesar + DNS.
- **Speaker notes:** –

#### Slide 4.1-16 · Demo D6: Sintaks
- **Tipe:** Demo (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```powershell
  # Di DC01 golden team (PowerShell)
  Resolve-DnsName stteam0lab.blob.core.windows.net        # SEBELUM: IP publik

  Add-DnsServerConditionalForwarderZone -Name "blob.core.windows.net" `
    -MasterServers <resolver-inbound-ip> -ReplicationScope Forest
  Clear-DnsServerCache -Force

  Resolve-DnsName stteam0lab.blob.core.windows.net        # SESUDAH: 10.0.x.x
  ```
  ```bash
  # Sisi Azure: rule untuk domain on-prem (extension dns-resolver)
  az dns-resolver forwarding-rule create -g rg-conn --ruleset-name frs-hub \
    --name team0-corp-local --domain-name "team0.corp.local." \
    --forwarding-rule-state Enabled \
    --target-dns-servers ip-address="172.16.0.4" port=53
  ```
- **Ilustrasi:** Latar gelap.
- **Speaker notes:** Domain pada rule diakhiri titik. Verifikasi sintaks CLI saat dry run.

#### Slide 4.1-17 · Demo D6: Tata cara dan hasil
- **Tipe:** Demo (langkah + hasil)
- **Waktu:** 8 menit
- **Pointers:**
  1. DC01: `Resolve-DnsName` → **IP publik**
  2. Tambah conditional forwarder ke inbound endpoint
  3. Ulangi → jawaban **CNAME** ke `…privatelink.blob.core.windows.net` lalu **A 10.0.x.x**
  4. VM di spoke Azure: `nslookup dc01.team0.corp.local` → IP `172.16.0.4`
- **Ilustrasi:** [Tabel] Sebelum vs sesudah: Name · Type · IP — sebelum: “stteam0lab.blob.core.windows.net · A · 20.x.x.x”; sesudah: “stteam0lab.blob.core.windows.net · CNAME · stteam0lab.privatelink.blob.core.windows.net” dan “… · A · 10.0.11.5”.
- **Speaker notes:** Kalimat inti: “Jika DNS salah, aplikasi tetap pergi ke IP publik dan diblokir.”

#### Slide 4.1-18 · Demo D6: Ilustrasi cadangan
- **Tipe:** Demo (fallback)
- **Waktu:** –
- **Pointers:** Di mana konfigurasi dan hasilnya terlihat
- **Ilustrasi:** [Mockup portal] Dua panel. Kiri: “DNS Manager” Windows di DC01 – folder **Conditional Forwarders** berisi “blob.core.windows.net → 10.0.2.4” (callout: “IP inbound endpoint”). Kanan: portal Azure breadcrumb `DNS forwarding rulesets > frs-hub > Forwarding rules` dengan baris “team0.corp.local. | 172.16.0.4:53 | Enabled”; tab **Virtual network links** dengan callout “Harus ter-link ke VNet yang memakai rule”.
- **Speaker notes:** –

#### Slide 4.1-19 · Quiz topik 4.1
- **Tipe:** Quiz
- **Waktu:** 5 menit
- **Pointers:**
  1. SKU VPN Gateway yang **tidak** cocok untuk produksi karena tanpa BGP dan active-active adalah… A. VpnGw1AZ B. Basic C. VpnGw2AZ D. VpnGw3AZ
  2. Peering location ExpressRoute yang lokal untuk Indonesia Central adalah… A. Singapore dan Hong Kong B. Jakarta dan Jakarta2 C. Tokyo D. Sydney
  3. Mengapa VPN dijalankan paralel saat memesan ExpressRoute? A. ExpressRoute gratis B. Provisioning ExpressRoute bisa memakan minggu–bulan C. VPN wajib D. ExpressRoute tidak aman
  4. DNS on-prem harus meneruskan zona apa ke inbound endpoint untuk storage blob? A. privatelink.blob.core.windows.net B. blob.core.windows.net C. corp.local D. 168.63.129.16
  5. Mengapa DNS on-prem tidak boleh diarahkan langsung ke 168.63.129.16? A. Alamat itu berbayar B. Tidak bisa dijangkau dari luar VNet Azure C. Itu IP Microsoft 365 D. Terlalu lambat
- **Ilustrasi:** Ikon tanda tanya.
- **Speaker notes (jawaban):** 1-B. 2-B. 3-B. 4-B (forward zona publik). 5-B.

#### Slide 4.1-20 · Lab 4A: Site-to-site VPN dan hybrid DNS (on-prem + Azure)
- **Tipe:** Lab
- **Waktu:** 75 menit (10:45–12:00)
- **Pointers:**
  - **Build – Azure:** aktifkan Network Contributor via PIM → Local Network Gateway → Connection + custom IPsec/IKE policy
  - **Build – On-prem:** isi `/etc/ipsec.conf` di RTR01 → `ipsec restart` → uji ping DC01 → VM spoke
  - **Build – DNS:** conditional forwarder di DC01; rule `teamN.corp.local.` di ruleset; uji dua arah
  - **Operate:** pantau status Connection; susun perbandingan VPN vs ExpressRoute (biaya, risiko, lead time)
  - **Kriteria sukses:** Connection **Connected**; ping lintas jalur berhasil; `Resolve-DnsName` memberi IP privat
- **Ilustrasi:** [Shapes] Arsitektur lab: kiri kotak abu-abu “Data center tim N 172.16.N.0/24” (DC01, RTR01 strongSwan); tengah awan internet dengan tunnel hijau “IPsec IKEv2”; kanan hub biru (VPN gateway, Azure Firewall, DNS Private Resolver inbound/outbound) di-peer ke spoke tim (VM, private endpoint storage). Panah DNS ungu putus-putus DC01 → inbound endpoint dan ruleset → DC01.
- **Speaker notes:** **Checkpoint waktu:** menit ke-35 tunnel harus Connected. Jika belum, lab assistant memberi konfigurasi jalur cepat agar tim tetap mengerjakan bagian DNS.

#### Slide 4.1-21 · Lab 4A: Sintaks sisi Azure
- **Tipe:** Lab (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```bash
  N=1
  az network local-gateway create -g rg-conn -n lng-team$N \
    --gateway-ip-address <RTR01_PUBLIC_IP> --local-address-prefixes 172.16.$N.0/24

  az network vpn-connection create -g rg-conn -n cn-team$N \
    --vnet-gateway1 vgw-hub --local-gateway2 lng-team$N --shared-key "<PSK>"

  az network vpn-connection ipsec-policy add -g rg-conn --connection-name cn-team$N \
    --ike-encryption AES256 --ike-integrity SHA256 --dh-group DHGroup14 \
    --ipsec-encryption AES256 --ipsec-integrity SHA256 --pfs-group None \
    --sa-lifetime 27000 --sa-max-size 102400000

  az network vpn-connection show -g rg-conn -n cn-team$N --query connectionStatus
  ```
- **Ilustrasi:** Latar gelap.
- **Speaker notes:** Custom policy membuat proposal kedua sisi eksplisit; ini pelajaran operasional penting.

#### Slide 4.1-22 · Lab 4A: Sintaks sisi on-prem (RTR01)
- **Tipe:** Lab (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```text
  # /etc/ipsec.conf
  conn azure-hub
      keyexchange=ikev2
      authby=secret
      left=%defaultroute
      leftid=<RTR01_PUBLIC_IP>
      leftsubnet=172.16.N.0/24
      right=<HUB_VPN_GATEWAY_PUBLIC_IP>
      rightsubnet=10.0.0.0/16
      ike=aes256-sha256-modp2048!
      esp=aes256-sha256!
      ikelifetime=28800s
      lifetime=27000s
      dpdaction=restart
      auto=start
  # /etc/ipsec.secrets
  <RTR01_PUBLIC_IP> <HUB_VPN_GATEWAY_PUBLIC_IP> : PSK "<PSK>"
  ```
  ```bash
  sudo ipsec restart && sudo ipsec statusall
  ```
- **Ilustrasi:** Latar gelap; highlight kuning pada baris yang harus diisi.
- **Speaker notes:** RTR01 berada di belakang NAT 1:1, sehingga `left` memakai IP privat dan `leftid` memakai IP publik. Validasi konfigurasi ini saat dry run.

#### Slide 4.1-23 · Lab 4A: Masalah umum
- **Tipe:** Lab (troubleshooting)
- **Waktu:** –
- **Pointers:** (tabel)
- **Ilustrasi:** [Tabel] Gejala · Solusi
  - NO_PROPOSAL_CHOSEN · samakan IPsec/IKE policy Azure dengan `ike=`/`esp=`
  - AUTHENTICATION_FAILED · PSK berbeda atau `leftid` bukan IP publik RTR01
  - Tunnel tidak mencoba tersambung · NSG RTR01 belum izinkan UDP 500/4500
  - Connected tetapi ping gagal · IP forwarding, UDR on-prem, NSG spoke, rule firewall
  - nslookup tetap IP publik · forwarder ke zona privatelink atau IP salah
  - Azure tidak resolve domain on-prem · rule tanpa titik akhir, ruleset tidak ter-link
- **Speaker notes:** –

#### Slide 4.1-24 · Summary topik 4.1
- **Tipe:** Summary
- **Waktu:** 2 menit
- **Pointers:**
  - VPN: cepat, SKU AZ, active-active; gateway 45+ menit
  - ExpressRoute Jakarta/Jakarta2: privat, lead time minggu–bulan
  - VPN sebagai failover; awasi asymmetric routing
  - Hybrid DNS: forwarder ke inbound endpoint, zona publik; ruleset untuk arah sebaliknya
- **Ilustrasi:** Ikon centang.
- **Speaker notes:** Transisi: “Jaringan dan DNS sudah tersambung. Bagaimana kita mengoperasikan dua dunia sekaligus?”

---

## Topik 4.2 – Operasi Lintas Dua Dunia + Lab 4B (13:00–15:00)

#### Slide 4.2-01 · Operasi Lintas Dua Dunia
- **Tipe:** Judul
- **Waktu:** –
- **Pointers:** Hari 4 · 13:00–15:00 · [ALL] konsep, Build + Operate di lab
- **Ilustrasi:** [Shapes] Dashboard di tengah dengan garis ke server on-prem (abu-abu) dan VM Azure (biru).
- **Speaker notes:** –

#### Slide 4.2-02 · Agenda
- **Tipe:** Agenda
- **Waktu:** 1 menit
- **Pointers:** Azure Monitor (10’) · Alert dan ITSM (6’) · Azure Arc (10’) · Patching, backup, DR (8’) · Keputusan DR Indonesia Central (8’) · Masa transisi tool (4’) · Demo D7 (8’) · Quiz (5’) · Lab 4B (60’)
- **Ilustrasi:** [SmartArt: Vertical Bullet List]
- **Speaker notes:** –

#### Slide 4.2-03 · Tujuan sesi
- **Tipe:** Tujuan
- **Waktu:** 1 menit
- **Pointers:**
  - Menjelaskan arsitektur monitoring terpusat untuk Azure dan on-prem
  - Mengarahkan alert ke action group dan ITSM
  - Mengelola server on-prem dengan Azure Arc
  - Mengambil keputusan DR untuk region tanpa pasangan
  - Membuat dashboard dan KPI operasional
- **Ilustrasi:** Ikon target.
- **Speaker notes:** –

#### Slide 4.2-04 · Azure Monitor: satu platform telemetry
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Sumber: Azure resource, VM, server Arc, aplikasi, Entra ID
  - Data: metrics, logs, traces, events
  - Fitur: insights, workbook, alert, query KQL
  - Dipakai juga oleh Defender for Cloud dan Sentinel
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/azure-monitor/fundamentals/media/overview/overview.svg`
- **Speaker notes:** –

#### Slide 4.2-05 · Arsitektur monitoring enterprise
- **Tipe:** Konten
- **Waktu:** 5 menit
- **Pointers:**
  - Log Analytics workspace terpusat di subscription Management
  - Diagnostic settings dipaksa oleh policy
  - Data collection rule (DCR) menentukan data yang dikumpulkan Azure Monitor Agent (AMA)
  - Integrasi: Sentinel, Defender XDR, ITSM
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/azure-monitor/fundamentals/media/enterprise-monitoring-architecture/architecture-diagram.png`
- **Speaker notes:** Validasi platform: log mengalir **sebelum** cutover, termasuk diagnostic settings, bukan hanya activity log.

#### Slide 4.2-06 · Alert → action group → ITSM
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - Alert rule = resource + sinyal + kondisi
  - Action group: email, SMS, Teams (Logic App), webhook, ITSM, runbook
  - Setiap alert punya **pemilik** dan **runbook**
  - Uji: minimal satu alert terbukti sampai ke tujuan
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/azure-monitor/alerts/media/alerts-overview/alerts.png`
- **Speaker notes:** Untuk Pertamina, tanyakan tool ITSM yang dipakai (contoh ServiceNow) dan siapa tim L1.

#### Slide 4.2-07 · Azure Arc: kelola server on-prem dari Azure
- **Tipe:** Konten
- **Waktu:** 6 menit
- **Pointers:**
  - Server on-prem/cloud lain menjadi resource Azure (resource ID, tag, RBAC)
  - Policy, monitoring (AMA), Update Manager, Defender for Servers
  - Hanya butuh **outbound HTTPS 443**; heartbeat setiap 5 menit
  - Server **tidak pindah** – yang pindah adalah cara mengelolanya
- **Ilustrasi:** [Shapes] Kiri: rak server on-prem dengan ikon agent “Connected Machine”. Panah hijau “HTTPS 443” ke awan Azure berisi ikon Policy, Monitor, Update Manager, Defender. Di portal: daftar mesin dengan ikon server on-prem di samping VM Azure.
- **Speaker notes:** –

#### Slide 4.2-08 · Komponen Azure Connected Machine agent
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:** Hybrid Instance Metadata Service (identitas, koneksi) · Machine configuration agent (policy) · Extension agent (AMA, dll.) · Arc Proxy
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/azure-arc/servers/media/agent-overview/connected-machine-agent.png`
- **Speaker notes:** Azure Monitor Agent adalah agent terpisah yang dipasang sebagai extension; tidak menggantikan Connected Machine agent.

#### Slide 4.2-09 · Patching, backup, dan Site Recovery
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - **Update Manager:** assessment dan jadwal patch untuk VM Azure dan server Arc
  - **Azure Backup:** proteksi VM, file, database
  - **Site Recovery:** replikasi untuk DR
  - Tetapkan pemilik patching dan vulnerability scanning sebelum workload pertama
- **Ilustrasi:** [SmartArt: Basic Process] Patch → Backup → Replikasi → Uji restore.
- **Speaker notes:** Backup yang tidak pernah diuji restore belum terbukti.

#### Slide 4.2-10 · Keputusan DR untuk Indonesia Central
- **Tipe:** Konten
- **Waktu:** 8 menit
- **Pointers:** (tabel)
- **Ilustrasi:** [Tabel] Opsi · Kelebihan · Pertimbangan
  - Zone-redundant di Indonesia Central · data tetap di Indonesia, failover otomatis banyak layanan · tidak melindungi dari gangguan seluruh region
  - DR ke Southeast Asia / Malaysia West · melindungi dari gangguan region · data keluar Indonesia → keputusan legal; biaya replikasi
  - DR ke data center on-prem Pertamina · data tetap di Indonesia, pakai aset yang ada · butuh bandwidth, kompleksitas operasional
- **Speaker notes:** Tidak ada jawaban tunggal. Tiap workload punya RPO/RTO dan klasifikasi data sendiri. Keputusan masuk Design Pack bagian 8.

#### Slide 4.2-11 · Masa transisi tool operasional
- **Tipe:** Konten
- **Waktu:** 4 menit
- **Pointers:**
  - SCOM dan Azure Monitor boleh berdampingan untuk periode tertentu
  - Buat daftar: tetap · diganti · dipensiunkan (dengan tanggal)
  - Setiap tool ganda menambah beban operasional
- **Ilustrasi:** [Shapes] Garis waktu dengan dua bar: “SCOM” memudar ke kanan, “Azure Monitor” menebal ke kanan; area tumpang tindih diberi label “periode transisi – tentukan tanggal akhir”.
- **Speaker notes:** –

#### Slide 4.2-12 · Demo D7: Arc-enabled server
- **Tipe:** Demo (tujuan)
- **Waktu:** 1 menit
- **Pointers:**
  - **Tujuan:** menunjukkan server on-prem yang dikelola dari Azure: status, extension, policy, insights, update
  - **Prasyarat:** APP01 golden team sudah onboarded ke Arc dengan AMA, DCR, dan policy
- **Ilustrasi:** Ikon server + awan.
- **Speaker notes:** –

#### Slide 4.2-13 · Demo D7: Sintaks
- **Tipe:** Demo (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```bash
  az extension add --name connectedmachine
  az connectedmachine list -g rg-arc-team0 \
    --query "[].{Nama:name, Status:status, OS:osName}" -o table
  az connectedmachine extension list -g rg-arc-team0 --machine-name APP01 -o table
  ```
  ```powershell
  # Di APP01
  azcmagent show          # Agent status : Connected
  ```
  ```kusto
  // Log Analytics
  Heartbeat
  | where Computer startswith "APP01"
  | summarize TerakhirTerlihat = max(TimeGenerated) by Computer, Category
  ```
- **Ilustrasi:** Latar gelap.
- **Speaker notes:** Category pada Heartbeat menunjukkan agent yang mengirim data.

#### Slide 4.2-14 · Demo D7: Tata cara dan hasil
- **Tipe:** Demo (langkah + hasil)
- **Waktu:** 7 menit
- **Pointers:**
  1. Azure Arc → **Machines** → APP01 berstatus **Connected**
  2. APP01 → **Extensions** (AzureMonitorWindowsAgent) · **Policies** (compliance) · **Insights**
  3. **Update Manager** → assessment update APP01
  4. Log Analytics → query Heartbeat → baris terbaru < 5 menit
- **Ilustrasi:** [MS Learn] `https://learn.microsoft.com/azure/azure-arc/servers/media/onboard-portal/arc-for-servers-successful-onboard.png`
- **Speaker notes:** Kalimat inti: “Server ini tetap di data center. Yang pindah ke Azure hanya cara kita mengelolanya.”

#### Slide 4.2-15 · Demo D7: Ilustrasi cadangan
- **Tipe:** Demo (fallback)
- **Waktu:** –
- **Pointers:** Di mana hasilnya terlihat
- **Ilustrasi:** [Mockup portal] Breadcrumb `Azure Arc > Machines`. Tabel: “APP01 | Connected | Windows Server 2022 | rg-arc-team0 | Indonesia Central”. Panel detail APP01 dengan menu kiri: Overview, Extensions, Policies, Insights, Updates. Callout hijau ke “Connected”: “Heartbeat 5 menit”. Callout biru ke “Extensions”: “AMA terpasang via policy/DCR”.
- **Speaker notes:** –

#### Slide 4.2-16 · Quiz topik 4.2
- **Tipe:** Quiz
- **Waktu:** 5 menit
- **Pointers:**
  1. Komponen yang menentukan data apa yang dikumpulkan Azure Monitor Agent adalah… A. Action group B. Data collection rule (DCR) C. Workbook D. Alert rule
  2. Koneksi yang dibutuhkan Azure Arc agent adalah… A. Inbound RDP B. Outbound HTTPS 443 C. VPN wajib D. ExpressRoute wajib
  3. Action group digunakan untuk… A. Menyimpan log B. Menentukan notifikasi/aksi saat alert terpicu C. Membuat VM D. Mengatur policy
  4. Opsi DR yang menjaga data tetap di Indonesia tetapi tidak melindungi dari gangguan seluruh region adalah… A. Zone-redundant di Indonesia Central B. DR ke Southeast Asia C. Tanpa backup D. Satu VM besar
  5. Arc agent dianggap terputus jika tidak mengirim heartbeat lebih dari… A. 1 menit B. 15 menit C. 24 jam D. 7 hari
- **Ilustrasi:** Ikon tanda tanya.
- **Speaker notes (jawaban):** 1-B. 2-B. 3-B. 4-A. 5-B (heartbeat setiap 5 menit; >15 menit menandakan masalah).

#### Slide 4.2-17 · Lab 4B: Azure Arc dan monitoring (on-prem + Azure)
- **Tipe:** Lab
- **Waktu:** 60 menit (14:00–15:00)
- **Pointers:**
  - **Build:** portal Azure Arc → Add machines → generate script (RG tim, Indonesia Central) → jalankan di APP01 → status Connected → assign DCR/policy AMA → buat alert CPU → uji beban CPU
  - **Operate:** workbook dashboard (VM Azure + server Arc); definisikan 5 KPI operasional
  - **Kriteria sukses:** APP01 Connected; Heartbeat muncul di Log Analytics; alert terpicu dan sampai ke action group
- **Ilustrasi:** [Shapes] Arsitektur lab: kotak abu-abu “Data center tim N” berisi APP01 (ikon agent Arc). Panah hijau APP01 → RTR01 → internet → Azure Arc + Log Analytics + Action group (email/Teams). Catatan: “Tidak butuh VPN”.
- **Speaker notes:** APP01 adalah Azure VM yang disiapkan agar terlihat seperti server on-prem (extension dihapus, guest agent dimatikan, IMDS diblokir, `MSFT_ARC_TEST` di-set). Hanya untuk evaluasi/training. Jelaskan agar peserta tidak bingung melihat dua resource (VM dan Arc machine).

#### Slide 4.2-18 · Lab 4B: Sintaks
- **Tipe:** Lab (sintaks)
- **Waktu:** –
- **Pointers (code block):**
  ```powershell
  # Di APP01 (PowerShell sebagai Administrator) – alternatif dari script portal
  azcmagent connect --resource-group rg-arc-team1 --tenant-id <tenant-id> `
    --subscription-id <sub-id> --location indonesiacentral
  azcmagent show

  # Uji beban CPU ±5 menit untuk memicu alert
  1..4 | ForEach-Object { Start-Job { $end=(Get-Date).AddMinutes(5); while((Get-Date) -lt $end){} } }
  ```
  ```kusto
  // Query alert (butuh DCR yang mengumpulkan performance counter)
  Perf
  | where Computer startswith "APP01" and CounterName == "% Processor Time"
  | summarize RataRata = avg(CounterValue) by bin(TimeGenerated, 5m)
  ```
- **Ilustrasi:** Latar gelap.
- **Speaker notes:** `azcmagent connect` tanpa service principal akan meminta login device code. Hentikan job beban CPU setelah alert terpicu: `Get-Job | Stop-Job`.

#### Slide 4.2-19 · Lab 4B: Hasil yang diharapkan
- **Tipe:** Lab (hasil)
- **Waktu:** –
- **Pointers:** `azcmagent show` → Agent status **Connected** · Portal: APP01 di Azure Arc > Machines · Heartbeat di Log Analytics · Alert “Fired” + email/Teams diterima
- **Ilustrasi:** [Shapes] Empat kartu bercentang hijau berurutan: “Connected” → “Extension AMA” → “Data masuk” → “Alert sampai”.
- **Speaker notes:** Data AMA dan alert butuh beberapa menit; isi waktu tunggu dengan tugas Operate.

#### Slide 4.2-20 · Lab 4B: Masalah umum
- **Tipe:** Lab (troubleshooting)
- **Waktu:** –
- **Pointers:** (tabel)
- **Ilustrasi:** [Tabel] Gejala · Solusi
  - Script berhenti: “running on an Azure VM” · Arc prep belum lengkap → lab assistant mengulang prep, buka sesi PowerShell baru
  - Gagal register / Disconnected · outbound 443 diblokir atau provider `Microsoft.HybridCompute` belum terdaftar
  - Extension AMA gagal · provider `Microsoft.GuestConfiguration`/`HybridConnectivity` belum terdaftar, DCR belum terasosiasi
  - Tidak ada data · tunggu 5–10 menit, cek tabel Heartbeat dan workspace tujuan DCR
- **Speaker notes:** –

#### Slide 4.2-21 · KPI operasional (Operate)
- **Tipe:** Lab (pendamping Operate)
- **Waktu:** –
- **Pointers:** % server compliant terhadap policy · Jumlah patch kritikal tertunda · Alert terbuka > 24 jam · Waktu respons alert P1 · Secure score
- **Ilustrasi:** [Shapes] Mockup workbook: 5 kartu KPI dengan angka contoh dan panah tren.
- **Speaker notes:** Manager dan analyst menentukan target setiap KPI.

#### Slide 4.2-22 · Summary topik 4.2
- **Tipe:** Summary
- **Waktu:** 2 menit
- **Pointers:**
  - Satu workspace terpusat; diagnostic settings via policy
  - Alert → action group → ITSM, dengan pemilik dan runbook
  - Azure Arc: server tetap on-prem, manajemen dari Azure
  - DR Indonesia Central: keputusan per workload
  - Tentukan tanggal pensiun tool lama
- **Ilustrasi:** Ikon centang.
- **Speaker notes:** –

---

## Topik 4.3 – Design Checkpoint 4 (15:15–16:00)

#### Slide 4.3-01 · Design checkpoint 4
- **Tipe:** Lab (workshop)
- **Waktu:** 35 menit
- **Pointers:** Design Pack **bagian 7** (konektivitas, redundansi, DNS, pemilik) dan **bagian 8** (monitoring, alert routing, backup, DR)
  - Pertanyaan pemicu: Bandwidth dan latensi yang dibutuhkan? · Provider mana yang sudah melayani Pertamina? · Data apa yang boleh keluar Indonesia untuk DR? · Tool monitoring mana yang dipensiunkan, kapan?
- **Ilustrasi:** Ikon dokumen + pena.
- **Speaker notes:** –

#### Slide 4.3-02 · Recap hari 4 dan preview hari 5
- **Tipe:** Summary
- **Waktu:** 10 menit
- **Pointers:** Hari ini: VPN, ExpressRoute, hybrid DNS, Azure Arc, monitoring, DR · Besok (Jumat): automation, onboarding workload, **game day**, **capstone** · Istirahat siang 11:30–13:00
- **Ilustrasi:** [Shapes] Panah ke ikon piala “Capstone”.
- **Speaker notes:** Malam ini Platform Owner meninjau Design Pack dan menandai bagian yang belum lengkap.
