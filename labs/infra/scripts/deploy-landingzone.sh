#!/usr/bin/env bash
# Langkah 3: spoke setiap tim di subscription landing zone (tanpa peering – dibuat peserta di Lab 3B).
source "$(dirname "$0")/lib.sh"

[[ -f "$OUT_DIR/hub-outputs.json" ]] || { echo "Jalankan deploy-hub.sh terlebih dahulu."; exit 1; }
PDZ_ID=$(out_value hub-outputs.json privateDnsZoneBlobId)

log "Deploy spoke untuk tim: $TEAMS"
az deployment sub create --subscription "$SUB_LANDINGZONE" -l "$LOCATION_AZURE" -n lab-landingzone \
  -f "$INFRA_DIR/landingzone/main.bicep" \
  -p teams="$(teams_json)" \
     location="$LOCATION_AZURE" \
     hubSubscriptionId="$SUB_CONNECTIVITY" \
     privateDnsZoneBlobId="$PDZ_ID" \
     adminUsername="$ADMIN_USERNAME" \
     adminPassword="$ADMIN_PASSWORD" \
     alertEmail="$ALERT_EMAIL" \
     budgetAmount="$BUDGET_AMOUNT" \
     budgetStartDate="$BUDGET_START_DATE" \
  --query properties.outputs -o json > "$OUT_DIR/landingzone-outputs.json"

log "Selesai. Nama storage account per tim (untuk kartu tim):"
jq -r '.spokes.value[] | "  team\(.team): \(.storageAccountName)  VM \(.vmPrivateIp)"' "$OUT_DIR/landingzone-outputs.json"
