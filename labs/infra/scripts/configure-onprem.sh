#!/usr/bin/env bash
# Langkah 5: konfigurasi OS data center simulasi per tim (paralel):
#   DC01  : promosi domain teamN.corp.local -> restart -> OU/user/KDS/forwarder/C:\LabFiles
#   VNet  : DNS server diarahkan ke DC01
#   APP01 : hapus extension -> persiapan Arc evaluation (IMDS diblokir, guest agent dimatikan)
# Log per tim: logs/configure-teamN.log
source "$(dirname "$0")/lib.sh"

configure_team() {
  local n=$1
  local rg="rg-onprem-team$n" dc="dc01-team$n" app="app01-team$n"

  log "[team$n] promosi DC01 menjadi domain controller team$n.corp.local"
  run_ps "$SUB_ONPREM" "$rg" "$dc" "$PS_DIR/dc01-promote.ps1" \
    "DomainName=team$n.corp.local" "NetbiosName=TEAM$n" "SafeModePassword=$SAFEMODE_PASSWORD"

  log "[team$n] restart DC01"
  az vm restart --subscription "$SUB_ONPREM" -g "$rg" -n "$dc" -o none
  sleep 180

  log "[team$n] konfigurasi AD (OU Sync-Users, user, KDS, forwarder, C:\\LabFiles)"
  run_ps "$SUB_ONPREM" "$rg" "$dc" "$PS_DIR/dc01-configure.ps1" \
    "DomainName=team$n.corp.local" "UserPassword=$AD_USER_PASSWORD" \
    "AdminUser=$ADMIN_USERNAME" "AgentUrl=${CLOUDSYNC_AGENT_URL:-}"

  log "[team$n] DNS VNet -> DC01 (172.16.$n.4)"
  az network vnet update --subscription "$SUB_ONPREM" -g "$rg" -n "vnet-onprem-team$n" \
    --dns-servers "172.16.$n.4" -o none

  local agent
  agent=$(az vm get-instance-view --subscription "$SUB_ONPREM" -g "$rg" -n "$app" \
    --query "instanceView.vmAgent.statuses[0].displayStatus" -o tsv 2>/dev/null || echo "")
  if [[ "$agent" == "Ready" ]]; then
    log "[team$n] APP01: hapus semua VM extension"
    local ext
    for ext in $(az vm extension list --subscription "$SUB_ONPREM" -g "$rg" --vm-name "$app" --query "[].name" -o tsv); do
      az vm extension delete --subscription "$SUB_ONPREM" -g "$rg" --vm-name "$app" -n "$ext" -o none
    done
    log "[team$n] APP01: persiapan Arc evaluation"
    run_ps "$SUB_ONPREM" "$rg" "$app" "$PS_DIR/app01-arc-prep.ps1"
  else
    log "[team$n] APP01: guest agent '$agent' – persiapan Arc dianggap sudah dilakukan, dilewati"
  fi

  log "[team$n] SELESAI"
}

pids=()
for n in $TEAMS; do
  configure_team "$n" > "$LOG_DIR/configure-team$n.log" 2>&1 &
  pids+=("$!:$n")
  log "Mulai konfigurasi team$n (log: logs/configure-team$n.log)"
done

failed=0
for entry in "${pids[@]}"; do
  pid=${entry%%:*}; n=${entry##*:}
  if wait "$pid"; then log "team$n OK"; else log "team$n GAGAL – lihat logs/configure-team$n.log"; failed=1; fi
done

[[ $failed -eq 0 ]] && log "Semua tim selesai. Jalankan smoke-test.sh." || exit 1
