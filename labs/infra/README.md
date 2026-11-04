# Lingkungan Lab – Infrastructure as Code

Template Bicep dan script untuk membangun lingkungan lab training *Azure Landing Zone: Design, Operate, and Connect*. Nama resource, alamat IP, dan role mengikuti **Lab Guide bagian 2** (`docs/lab_guide_azure-landing-zone-pertamina.docx`).

> **Status:** template sudah dikompilasi dengan `bicep build` (linter bersih) dan script bash lolos `bash -n`, tetapi **belum di-deploy ke Azure**. Jalankan seluruh alur di bawah dan semua lab saat **dry run T-7**.

## Arsitektur

```text
 SUBSCRIPTION ONPREM (Southeast Asia, MG terpisah)      SUBSCRIPTION CONNECTIVITY (Indonesia Central)
 rg-onprem-shared: vnet 172.31.255.0/24 + Bastion        rg-conn: vnet-hub 10.0.0.0/22
        │ peering (hanya untuk Bastion)                    ├ fw-hub        10.0.1.4 (Azure Firewall Standard)
 rg-onprem-teamN: vnet 172.16.N.0/24                      ├ vgw-hub       VpnGw1AZ   ◀══ IPsec (Lab 4A) ══╗
   DC01  172.16.N.4   AD DS + DNS (teamN.corp.local)      ├ dnspr-hub     inbound 10.0.2.4 / outbound      ║
   APP01 172.16.N.5   disiapkan untuk Arc evaluation      ├ frs-hub       forwarding ruleset               ║
   RTR01 172.16.N.132 strongSwan + NAT (internet edge) ═══╩═══════════════════════════════════════════════╝
                                                           └ privatelink.blob.core.windows.net
 SUBSCRIPTION LANDING ZONE (Indonesia Central, MG Corp)
 rg-spoke-teamN: vnet-spoke-teamN 10.0.(10+N).0/24, vm-app-teamN, storage + private endpoint, action group
 rg-arc-teamN  : kosong (Lab 4B)
```

Data center simulasi **tidak** di-peer ke landing zone. Satu-satunya jalur adalah VPN yang dibangun peserta di Lab 4A. Server on-prem keluar ke internet melalui NAT di RTR01, karena VNet baru (setelah 30 September 2025) tidak lagi mendapat akses internet implisit.

## Isi folder

| Path | Isi |
|---|---|
| `config/lab.env.example` | Semua parameter (subscription, MG, region, tim, password). Salin ke `lab.env`. |
| `config/participants.csv.example` | Daftar peserta: prefix UPN, nama, tim, peran (lead/engineer/manager/analyst). |
| `hub/main.bicep` | Hub: VNet, Azure Firewall + policy + diagnostic, VPN gateway, DNS Private Resolver, ruleset, private DNS zone blob. |
| `governance/main.bicep` | Policy lab di MG Landing Zones: allowed locations (Deny), audit tag wajib. |
| `landingzone/main.bicep` | Spoke per tim, rg-arc, link ruleset ke spoke, budget subscription. |
| `onprem-sim/main.bicep` | Data center simulasi per tim + Bastion bersama. |
| `onprem-sim/cloud-init/rtr01.yaml` | strongSwan, IP forwarding, NAT, template `/etc/ipsec.conf` untuk Lab 4A. |
| `scripts/*.sh` | Orkestrasi deploy, konfigurasi, identitas, smoke test, start, teardown. |
| `scripts/ps/*.ps1` | Promosi DC01, konfigurasi AD, persiapan Arc di APP01. |
| `../lab5a-repo/` | Template repository untuk Lab 5A (modul spoke + workflow GitHub Actions). |

## Prasyarat

- Training tenant Microsoft Entra ID terpisah (jangan tenant produksi Pertamina).
- Platform landing zone dari **ALZ IaC Accelerator** dengan **connectivity = none** (hub dibuat oleh template ini) dan Log Analytics workspace di subscription Management.
- 4 subscription: Connectivity, Management, Landing zone (di bawah MG **Corp**), Onprem-sim (di MG **terpisah** di luar Landing Zones, karena memakai region Southeast Asia dan IP publik).
- Akun yang menjalankan script: Owner di semua subscription lab, akses deploy di MG Landing Zones, dan Global Administrator / Privileged Role Administrator di training tenant.
- Azure Cloud Shell (Bash) – sudah berisi `az`, `jq`, dan Bicep.
- Kuota vCPU B-series: per tim ±7 vCPU (B2ms + B2s + 2×B1s) di dua region.
- Resource provider terdaftar di subscription landing zone: `Microsoft.HybridCompute`, `Microsoft.GuestConfiguration`, `Microsoft.HybridConnectivity`, `Microsoft.Insights`, `Microsoft.Network`, `Microsoft.Compute`, `Microsoft.Storage`, `Microsoft.DevTestLab`.

## Alur deploy

```bash
cd labs/infra
cp config/lab.env.example config/lab.env                    # isi semua nilai
cp config/participants.csv.example config/participants.csv  # isi daftar peserta
chmod +x scripts/*.sh
```

| Urutan | Kapan | Perintah | Durasi | Hasil |
|---|---|---|---|---|
| 1 | T-14 | `scripts/deploy-hub.sh` | 45–60 m | `config/hub-outputs.json` (IP VPN gateway untuk papan kelas) |
| 2 | T-14 | `scripts/deploy-governance.sh` | 2 m | Policy allowed locations + audit tag |
| 3 | T-7 (1 tim) / T-1 (semua) | `scripts/deploy-landingzone.sh` | 10 m | Spoke per tim; nama storage untuk kartu tim |
| 4 | T-7 / T-1 | `scripts/deploy-onprem.sh` | 15 m | Data center simulasi; IP publik RTR01 untuk kartu tim |
| 5 | T-7 / T-1 | `scripts/configure-onprem.sh` | 25–35 m | Domain, OU, user, Arc prep (paralel per tim, log di `logs/`) |
| 6 | T-10 | `scripts/create-identities.sh` | 5 m | User, grup, RBAC, PIM eligibility |
| 7 | T-1 dan setiap pagi | `scripts/smoke-test.sh` | 5 m | Tabel PASS/FAIL |
| – | Setiap pagi 07:30 | `scripts/start-lab.sh` | 1 m | Semua VM dinyalakan (auto-shutdown 16:30 WIB) |
| – | Setelah hari 5 | `scripts/teardown.sh [--include-hub]` | 20 m | Semua resource lab dihapus |

Untuk dry run T-7, set `TEAMS="0"` di `lab.env` (golden team), jalankan langkah 3–5 dan 7, kerjakan semua lab, lalu ubah `TEAMS` ke daftar lengkap pada T-1.

## Langkah manual

1. **Installer Cloud Sync agent** – unduh dari Entra admin center › Entra ID › Entra Connect › Cloud sync › Agents › *Download on-premises agent*. Isi `CLOUDSYNC_AGENT_URL` dengan lokasi file (misalnya blob dengan SAS) **atau** salin manual ke `C:\LabFiles\AADConnectProvisioningAgentSetup.exe` di setiap DC01.
2. **Approval PIM** – lihat pesan di akhir `create-identities.sh`: wajibkan approval untuk Network Contributor (rg-conn) dan Role Based Access Control Administrator (rg-spoke-teamN), approver = `grp-teamN-managers`.
3. **Resource non-compliant contoh (T-3)** – template sudah membuat resource tanpa tag CostCenter di setiap spoke. Tunggu evaluasi policy (±30 menit setelah deploy) atau jalankan `az policy state trigger-scan`.
4. **Data biaya Lab 2B** – siapkan subscription demo yang sudah berjalan beberapa hari, atau screenshot.
5. **Repository Lab 5A** – lihat `../lab5a-repo/README.md`.
6. **Kartu tim** – isi dari output: IP publik RTR01, IP publik vgw-hub, PSK (buat sendiri per tim), nama storage account, password.

## Hal penting

- **APP01** adalah Azure VM yang disiapkan untuk *Arc evaluation*: extension dihapus, `MSFT_ARC_TEST=true`, IMDS diblokir, Azure guest agent dimatikan. Setelah itu Run Command dan extension **tidak** bisa dipakai lagi. Hanya untuk training.
- **RTR01** menjalankan NAT untuk subnet server tim kecuali trafik ke `10.0.0.0/16` (lewat IPsec). Jangan mengubah `lab-nat.service`.
- **DNS VNet on-prem** diarahkan ke DC01 setelah promosi. DC01 meneruskan ke `168.63.129.16` untuk resolusi internet (simulasi DNS ISP).
- **Firewall hub** mengizinkan semua trafik 172.16.0.0/16 ↔ 10.0.0.0/16 dan FQDN `*.microsoft.com`, `*.azure.com`, `*.windows.net`, `*.ubuntu.com` dari spoke.
- **Biaya**: komponen termahal adalah Azure Firewall Standard, VPN gateway, dan Bastion. Hitung dengan Azure Pricing Calculator; hapus segera setelah training dengan `teardown.sh --include-hub`.

## Troubleshooting deploy

| Gejala | Solusi |
|---|---|
| `RequestDisallowedByPolicy` saat deploy onprem-sim | Subscription onprem berada di bawah MG yang punya allowed locations/deny public IP. Pindahkan ke MG terpisah. |
| `configure-onprem.sh` gagal di promosi | Lihat `logs/configure-teamN.log`. Jalankan ulang – script melewati langkah yang sudah selesai. |
| DC01 `https443=False` di smoke test | RTR01 belum siap (`/var/lib/lab-rtr01-ready` tidak ada) atau route table server salah. Restart RTR01, cek `systemctl status lab-nat`. |
| APP01 guest agent masih `Ready` | Scheduled task belum jalan; tunggu 2 menit, atau jalankan ulang `configure-onprem.sh`. |
| `create-identities.sh` eligibility gagal | Akun pelaksana kurang hak (perlu Owner/User Access Administrator dan Privileged Role Administrator) atau eligibility sudah ada. |
