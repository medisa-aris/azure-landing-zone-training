#!/usr/bin/env bash
# Langkah 7 (T-1 dan setiap pagi 07:30): periksa kesiapan lingkungan lab.
# Hasil: tabel PASS/FAIL per pemeriksaan. Exit code 1 jika ada FAIL.
source "$(dirname "$0")/lib.sh"

results=()
check() {  # check <nama> <hasil-aktual> <pola-yang-diharapkan>
  if [[ "$2" =~ $3 ]]; then results+=("PASS|$1|$2"); else results+=("FAIL|$1|$2"); fi
}

DC_CHECK_PS="$LOG_DIR/smoke-dc01-check.ps1"
cat > "$DC_CHECK_PS" <<'PS'
$d = try { (Get-ADDomain).DNSRoot } catch { 'NO-AD' }
$t = (Test-NetConnection login.microsoftonline.com -Port 443 -WarningAction SilentlyContinue).TcpTestSucceeded
$k = [bool](Get-KdsRootKey)
$i = Test-Path 'C:\LabFiles\AADConnectProvisioningAgentSetup.exe'
"domain=$d https443=$t kds=$k installer=$i"
PS

log "Hub (rg-conn)"
check "VPN gateway vgw-hub" \
  "$(az network vnet-gateway show --subscription "$SUB_CONNECTIVITY" -g rg-conn -n vgw-hub --query provisioningState -o tsv 2>/dev/null || echo missing)" '^Succeeded$'
check "Azure Firewall IP privat" \
  "$(az network firewall show --subscription "$SUB_CONNECTIVITY" -g rg-conn -n fw-hub --query 'ipConfigurations[0].privateIPAddress' -o tsv 2>/dev/null || echo missing)" '^10\.0\.1\.4$'
check "DNS resolver inbound" \
  "$(az dns-resolver inbound-endpoint show --subscription "$SUB_CONNECTIVITY" -g rg-conn --dns-resolver-name dnspr-hub -n in-hub --query 'ipConfigurations[0].privateIpAddress' -o tsv 2>/dev/null || echo missing)" '^10\.0\.2\.4$'

for n in $TEAMS; do
  log "Tim $n"
  rgS="rg-spoke-team$n"; rgO="rg-onprem-team$n"

  check "team$n vm-app running" \
    "$(az vm get-instance-view --subscription "$SUB_LANDINGZONE" -g "$rgS" -n "vm-app-team$n" --query "instanceView.statuses[?starts_with(code,'PowerState')].displayStatus | [0]" -o tsv 2>/dev/null || echo missing)" 'running'
  check "team$n ruleset link spoke" \
    "$(az dns-resolver vnet-link show --subscription "$SUB_CONNECTIVITY" -g rg-conn --ruleset-name frs-hub -n "link-vnet-spoke-team$n" --query provisioningState -o tsv 2>/dev/null || echo missing)" '^Succeeded$'

  dc=$(run_ps "$SUB_ONPREM" "$rgO" "dc01-team$n" "$DC_CHECK_PS" 2>/dev/null || echo "run-command gagal")
  check "team$n DC01 AD + internet + KDS" "$dc" "domain=team$n\.corp\.local https443=True kds=True"
  check "team$n DC01 installer Cloud Sync" "$dc" 'installer=True'

  rtr=$(run_sh "$SUB_ONPREM" "$rgO" "rtr01-team$n" \
    'echo "fwd=$(sysctl -n net.ipv4.ip_forward) nat=$(iptables -t nat -S POSTROUTING | grep -c MASQUERADE) ready=$(test -f /var/lib/lab-rtr01-ready && echo yes || echo no) ipsec=$(command -v ipsec >/dev/null && echo yes || echo no)"' 2>/dev/null || echo "run-command gagal")
  check "team$n RTR01 forwarding/NAT/strongSwan" "$rtr" 'fwd=1 nat=[1-9].*ready=yes ipsec=yes'

  check "team$n APP01 guest agent dimatikan (Arc prep)" \
    "$(az vm get-instance-view --subscription "$SUB_ONPREM" -g "$rgO" -n "app01-team$n" --query "instanceView.vmAgent.statuses[0].displayStatus" -o tsv 2>/dev/null || echo missing)" '^Not Ready$'
  check "team$n APP01 tanpa extension" \
    "$(az vm extension list --subscription "$SUB_ONPREM" -g "$rgO" --vm-name "app01-team$n" --query 'length(@)' -o tsv 2>/dev/null || echo missing)" '^0$'
done

printf '\n%-5s | %-45s | %s\n' "HASIL" "PEMERIKSAAN" "NILAI"
printf -- '------+-----------------------------------------------+------------------------------\n'
fail=0
for r in "${results[@]}"; do
  IFS='|' read -r status name value <<< "$r"
  printf '%-5s | %-45s | %s\n' "$status" "$name" "$value"
  [[ "$status" == "FAIL" ]] && fail=1
done
exit $fail
