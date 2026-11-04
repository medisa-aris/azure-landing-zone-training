#!/usr/bin/env bash
# Langkah 1 (T-14): hub network di subscription Connectivity (rg-conn).
# VPN gateway butuh 45 menit atau lebih – jalankan paling awal.
source "$(dirname "$0")/lib.sh"

log "Membuat resource group rg-conn di $LOCATION_AZURE"
az group create --subscription "$SUB_CONNECTIVITY" -n rg-conn -l "$LOCATION_AZURE" \
  --tags Environment=training CostCenter=CC-TRAINING-PLATFORM Owner=platform-team -o none

log "Deploy hub (firewall, VPN gateway, DNS Private Resolver, private DNS zone) – dapat memakan 45–60 menit"
az deployment group create --subscription "$SUB_CONNECTIVITY" -g rg-conn -n lab-hub \
  -f "$INFRA_DIR/hub/main.bicep" \
  -p location="$LOCATION_AZURE" logAnalyticsWorkspaceId="$LAW_RESOURCE_ID" \
  --query properties.outputs -o json > "$OUT_DIR/hub-outputs.json"

log "Selesai. Output disimpan di config/hub-outputs.json:"
jq -r 'to_entries[] | "  \(.key) = \(.value.value)"' "$OUT_DIR/hub-outputs.json"
log "Tulis vpnGatewayPublicIp di papan kelas (dipakai peserta di Lab 4A)."
