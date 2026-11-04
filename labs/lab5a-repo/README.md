# Repository Lab 5A – Platform Automation

Template repository untuk Lab 5A. Peserta mengubah `teams/teamN/spoke2.bicepparam` melalui pull request; GitHub Actions menjalankan **what-if** di pull request dan **deploy** setelah merge ke `main`.

## Struktur

```text
config/platform.json              # nilai platform: subscription hub, rg-conn, vnet-hub, IP firewall
modules/spoke/main.bicep          # VNet + route table ke firewall + peering ke hub
modules/spoke/hub-peering.bicep   # sisi hub dari peering (deploy ke rg-conn)
teams/team1/spoke2.bicepparam     # contoh – salin untuk setiap tim
.github/workflows/platform-spokes.yml
```

## Persiapan trainer

1. Buat repository baru (GitHub) dari isi folder ini.
2. Isi `config/platform.json` dengan subscription Connectivity yang sebenarnya.
3. Salin `teams/team1` menjadi `teams/team0`, `teams/team2`, … dan biarkan nilai placeholder (peserta yang mengisi).
4. Buat app registration / user-assigned managed identity dengan **federated credential** untuk repository ini (subject: pull request dan branch `main`).
5. Beri identitas tersebut: **Contributor** di setiap `rg-spoke-teamN` dan **Network Contributor** di `rg-conn`.
6. Tambahkan secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` (subscription landing zone).
7. Lindungi branch `main`: wajib pull request + 1 approval; batasi akses tulis tim hanya ke folder masing-masing dengan **CODEOWNERS** (contoh `teams/team1/ @org/grp-team1-managers`).
8. Uji dengan golden team (team0) saat dry run T-7.

## Validasi lokal

```bash
az bicep build --file modules/spoke/main.bicep
az bicep build-params --file teams/team1/spoke2.bicepparam
```

Address space `10.0.(20+N).0/24` dipakai agar tidak bentrok dengan spoke pertama `10.0.(10+N).0/24`.
