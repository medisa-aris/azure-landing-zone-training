#!/usr/bin/env bash
# Setelah hari 5: hapus semua resource lab.
#   ./teardown.sh               -> resource tim (spoke, Arc, data center simulasi, objek di rg-conn milik tim)
#   ./teardown.sh --include-hub -> juga rg-conn (hub) dan policy lab
# Tidak menghapus akun/grup Entra ID dan konfigurasi Cloud Sync – lihat daftar manual di akhir.
source "$(dirname "$0")/lib.sh"

INCLUDE_HUB=false
[[ "${1:-}" == "--include-hub" ]] && INCLUDE_HUB=true

echo "Akan MENGHAPUS resource lab untuk tim: $TEAMS"
$INCLUDE_HUB && echo "TERMASUK hub rg-conn dan policy lab di $MG_LANDINGZONES"
confirm "Tindakan ini tidak bisa dibatalkan." "HAPUS"

for n in $TEAMS; do
  log "Tim $n: objek di rg-conn (connection, local network gateway, forwarding rule, link ruleset, peering hub)"
  az network vpn-connection delete --subscription "$SUB_CONNECTIVITY" -g rg-conn -n "cn-team$n" 2>/dev/null || true
  az network local-gateway delete --subscription "$SUB_CONNECTIVITY" -g rg-conn -n "lng-team$n" 2>/dev/null || true
  az dns-resolver forwarding-rule delete --subscription "$SUB_CONNECTIVITY" -g rg-conn --ruleset-name frs-hub -n "team$n-corp-local" --yes 2>/dev/null || true
  az dns-resolver vnet-link delete --subscription "$SUB_CONNECTIVITY" -g rg-conn --ruleset-name frs-hub -n "link-vnet-spoke-team$n" --yes 2>/dev/null || true
  for p in $(az network vnet peering list --subscription "$SUB_CONNECTIVITY" -g rg-conn --vnet-name vnet-hub --query "[?contains(name,'team$n')].name" -o tsv 2>/dev/null); do
    az network vnet peering delete --subscription "$SUB_CONNECTIVITY" -g rg-conn --vnet-name vnet-hub -n "$p"
  done

  log "Tim $n: resource group"
  for rg in "rg-spoke-team$n" "rg-arc-team$n"; do
    az group delete --subscription "$SUB_LANDINGZONE" -n "$rg" --yes --no-wait 2>/dev/null || true
  done
  az group delete --subscription "$SUB_ONPREM" -n "rg-onprem-team$n" --yes --no-wait 2>/dev/null || true
done

az group delete --subscription "$SUB_ONPREM" -n rg-onprem-shared --yes --no-wait 2>/dev/null || true
az consumption budget delete --subscription "$SUB_LANDINGZONE" --budget-name budget-training-landingzone 2>/dev/null || true

if $INCLUDE_HUB; then
  log "Hub dan policy lab"
  az group delete --subscription "$SUB_CONNECTIVITY" -n rg-conn --yes --no-wait
  for a in $(az policy assignment list --scope "/providers/Microsoft.Management/managementGroups/$MG_LANDINGZONES" --query "[?starts_with(name,'lab-')].name" -o tsv); do
    az policy assignment delete --name "$a" --scope "/providers/Microsoft.Management/managementGroups/$MG_LANDINGZONES"
  done
  az policy definition delete --name lab-audit-required-tag --management-group "$MG_LANDINGZONES" 2>/dev/null || true
fi

cat <<'EOF'

Penghapusan resource group berjalan di background (--no-wait). Periksa di portal setelah ±20 menit.

LANGKAH MANUAL:
 1. Entra admin center > Entra Connect > Cloud sync: hapus configuration teamN.corp.local dan agent.
 2. Entra ID > Users: hapus user tersinkron (OU Sync-Users) dan akun userNN peserta.
 3. Hapus grup grp-teamN-* dan PIM eligibility yang tersisa.
 4. Hapus Conditional Access policy CA-teamN-* (report-only).
 5. Repository Lab 5A: hapus branch teamN/* dan spoke2 (jika sudah di-merge, revert lalu jalankan pipeline).
 6. Periksa Cost Management keesokan harinya untuk memastikan tidak ada biaya berjalan.
EOF
