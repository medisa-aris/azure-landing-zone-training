#!/usr/bin/env bash
# Setiap pagi 07:30: nyalakan semua VM lab (auto-shutdown mematikannya pukul 16:30 WIB).
source "$(dirname "$0")/lib.sh"

for n in $TEAMS; do
  for vm in rtr01 dc01 app01; do
    log "start $vm-team$n"
    az vm start --subscription "$SUB_ONPREM" -g "rg-onprem-team$n" -n "$vm-team$n" --no-wait
  done
  log "start vm-app-team$n"
  az vm start --subscription "$SUB_LANDINGZONE" -g "rg-spoke-team$n" -n "vm-app-team$n" --no-wait
done
log "Perintah start terkirim. Tunggu ±5 menit (DC01 butuh waktu lebih lama), lalu jalankan smoke-test.sh."
