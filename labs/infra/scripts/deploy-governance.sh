#!/usr/bin/env bash
# Langkah 2: policy lab (allowed locations + audit tag wajib) di management group Landing Zones.
source "$(dirname "$0")/lib.sh"

log "Deploy policy lab ke management group $MG_LANDINGZONES"
az deployment mg create --management-group-id "$MG_LANDINGZONES" -l "$LOCATION_AZURE" -n lab-governance \
  -f "$INFRA_DIR/governance/main.bicep" -o none

log "Selesai. Evaluasi compliance awal butuh ±30 menit; jalankan deploy-landingzone.sh sesudahnya."
