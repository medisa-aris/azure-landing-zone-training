#!/usr/bin/env bash
# Langkah 4: data center simulasi per tim (VM, jaringan, Bastion). Konfigurasi OS dilakukan configure-onprem.sh.
source "$(dirname "$0")/lib.sh"

HUB_GW_IP=""
if [[ -f "$OUT_DIR/hub-outputs.json" ]]; then
  HUB_GW_IP=$(out_value hub-outputs.json vpnGatewayPublicIp)
fi
[[ -n "$HUB_GW_IP" ]] || log "PERINGATAN: IP VPN gateway hub belum diketahui – NSG RTR01 mengizinkan UDP 500/4500 dari Internet."

log "Deploy data center simulasi untuk tim: $TEAMS (region $LOCATION_ONPREM)"
az deployment sub create --subscription "$SUB_ONPREM" -l "$LOCATION_ONPREM" -n lab-onprem \
  -f "$INFRA_DIR/onprem-sim/main.bicep" \
  -p teams="$(teams_json)" \
     location="$LOCATION_ONPREM" \
     hubGatewayPublicIp="$HUB_GW_IP" \
     adminUsername="$ADMIN_USERNAME" \
     adminPassword="$ADMIN_PASSWORD" \
  --query properties.outputs -o json > "$OUT_DIR/onprem-outputs.json"

log "Selesai. IP publik RTR01 per tim (untuk kartu tim):"
jq -r '.teams.value[] | "  team\(.team): RTR01 \(.rtr01PublicIp)  DC01 \(.dc01PrivateIp)  APP01 \(.app01PrivateIp)"' "$OUT_DIR/onprem-outputs.json"
log "Lanjutkan dengan configure-onprem.sh (±30 menit, tim dikerjakan paralel)."
