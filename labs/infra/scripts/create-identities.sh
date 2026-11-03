#!/usr/bin/env bash
# Langkah 6 (T-10): akun peserta, grup, RBAC aktif, dan PIM eligibility.
# Input : config/participants.csv  (kolom: upn_prefix,display_name,team,role)
#         role = lead | engineer | manager | analyst
# Butuh : Global Administrator / Privileged Role Administrator di training tenant,
#         dan Owner / User Access Administrator di subscription lab.
# Aman dijalankan ulang (idempotent sebisa mungkin).
source "$(dirname "$0")/lib.sh"

CSV="$OUT_DIR/participants.csv"
[[ -f "$CSV" ]] || { echo "Buat $CSV (contoh: participants.csv.example)."; exit 1; }

GRAPH="https://graph.microsoft.com/v1.0"
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
DURATION="P21D"   # eligibility berlaku 3 minggu (persiapan + training)

# ---------------------------------------------------------------- helper
ensure_group() {  # ensure_group <displayName> -> object id
  local name=$1 id
  id=$(az ad group list --display-name "$name" --query "[0].id" -o tsv)
  if [[ -z "$id" ]]; then
    id=$(az ad group create --display-name "$name" --mail-nickname "$name" --query id -o tsv)
    log "  grup dibuat: $name" >&2
  fi
  echo "$id"
}

ensure_user() {  # ensure_user <upn> <displayName> -> object id
  local upn=$1 name=$2 id
  id=$(az ad user list --upn "$upn" --query "[0].id" -o tsv)
  if [[ -z "$id" ]]; then
    id=$(az ad user create --user-principal-name "$upn" --display-name "$name" \
      --password "$PARTICIPANT_PASSWORD" --force-change-password-next-sign-in false --query id -o tsv)
    log "  user dibuat: $upn" >&2
  fi
  echo "$id"
}

add_member() {  # add_member <groupId> <memberId>
  if [[ "$(az ad group member check --group "$1" --member-id "$2" --query value -o tsv)" != "true" ]]; then
    az ad group member add --group "$1" --member-id "$2"
  fi
}

assign_role() {  # assign_role <principalId> <roleName> <scope>
  az role assignment create --assignee-object-id "$1" --assignee-principal-type Group \
    --role "$2" --scope "$3" -o none 2>/dev/null || true
}

# PIM eligibility untuk role Azure resource (ARM)
eligible_azure_role() {  # eligible_azure_role <principalId> <roleName> <scope> <subscriptionId>
  local principal=$1 role=$2 scope=$3 sub=$4 roleId
  roleId=$(az role definition list --name "$role" --query "[0].name" -o tsv)
  az rest --method put \
    --url "https://management.azure.com${scope}/providers/Microsoft.Authorization/roleEligibilityScheduleRequests/$(new_guid)?api-version=2020-10-01" \
    --body "{\"properties\":{\"principalId\":\"$principal\",\"roleDefinitionId\":\"/subscriptions/$sub/providers/Microsoft.Authorization/roleDefinitions/$roleId\",\"requestType\":\"AdminAssign\",\"justification\":\"Training lab\",\"scheduleInfo\":{\"startDateTime\":\"$NOW\",\"expiration\":{\"type\":\"AfterDuration\",\"duration\":\"$DURATION\"}}}}" \
    -o none 2>/dev/null && log "  eligible: $role @ ${scope##*/}" || log "  (sudah ada / gagal) eligible: $role @ ${scope##*/}"
}

entra_role_id() {  # entra_role_id <displayName>
  az rest --method get --url "$GRAPH/roleManagement/directory/roleDefinitions?\$filter=displayName eq '$1'" \
    --query "value[0].id" -o tsv
}

eligible_entra_role() {  # eligible_entra_role <principalId> <roleDisplayName>
  local rid; rid=$(entra_role_id "$2")
  az rest --method post --url "$GRAPH/roleManagement/directory/roleEligibilityScheduleRequests" \
    --body "{\"action\":\"adminAssign\",\"justification\":\"Training lab\",\"roleDefinitionId\":\"$rid\",\"directoryScopeId\":\"/\",\"principalId\":\"$1\",\"scheduleInfo\":{\"startDateTime\":\"$NOW\",\"expiration\":{\"type\":\"afterDuration\",\"duration\":\"$DURATION\"}}}" \
    -o none 2>/dev/null && log "  eligible Entra: $2" || log "  (sudah ada / gagal) eligible Entra: $2"
}

active_entra_role() {  # active_entra_role <principalId> <roleDisplayName>
  local rid; rid=$(entra_role_id "$2")
  az rest --method post --url "$GRAPH/roleManagement/directory/roleAssignments" \
    --body "{\"roleDefinitionId\":\"$rid\",\"directoryScopeId\":\"/\",\"principalId\":\"$1\"}" \
    -o none 2>/dev/null && log "  aktif Entra: $2" || log "  (sudah ada / gagal) aktif Entra: $2"
}

# ---------------------------------------------------------------- scope
LZ="/subscriptions/$SUB_LANDINGZONE"
CONN_RG="/subscriptions/$SUB_CONNECTIVITY/resourceGroups/rg-conn"
ONPREM="/subscriptions/$SUB_ONPREM"
MG_SCOPE="/providers/Microsoft.Management/managementGroups/$MG_ROOT"

# ---------------------------------------------------------------- grup per tim
declare -A G_USERS G_ENG G_MGR
for n in $TEAMS; do
  log "Tim $n: grup"
  G_USERS[$n]=$(ensure_group "grp-team$n-users")
  G_ENG[$n]=$(ensure_group "grp-team$n-engineers")
  G_MGR[$n]=$(ensure_group "grp-team$n-managers")
  ensure_group "grp-team$n-auditors" >/dev/null   # target role assignment di Lab 3A
done

# ---------------------------------------------------------------- user
log "Membuat user dari $CSV"
tail -n +2 "$CSV" | while IFS=, read -r prefix name team role; do
  [[ -z "$prefix" ]] && continue
  upn="$prefix@$TENANT_DOMAIN"
  uid=$(ensure_user "$upn" "$name")
  add_member "${G_USERS[$team]}" "$uid"
  case "$role" in
    lead)
      add_member "${G_ENG[$team]}" "$uid"
      eligible_entra_role "$uid" "Hybrid Identity Administrator"
      eligible_entra_role "$uid" "Conditional Access Administrator"
      ;;
    engineer) add_member "${G_ENG[$team]}" "$uid" ;;
    manager | analyst)
      [[ "$role" == "manager" ]] && add_member "${G_MGR[$team]}" "$uid"
      active_entra_role "$uid" "Global Reader"   # sign-in logs, provisioning logs (Lab 3A/3C Operate)
      ;;
    *) log "  role tidak dikenal untuk $upn: $role" ;;
  esac
done

# ---------------------------------------------------------------- RBAC Azure
LAW_SCOPE="$LAW_RESOURCE_ID"
for n in $TEAMS; do
  log "Tim $n: RBAC aktif"
  assign_role "${G_USERS[$n]}" "Reader" "$MG_SCOPE"
  assign_role "${G_USERS[$n]}" "Reader" "$ONPREM/resourceGroups/rg-onprem-team$n"         # Bastion
  assign_role "${G_USERS[$n]}" "Reader" "$ONPREM/resourceGroups/rg-onprem-shared"         # Bastion
  assign_role "${G_USERS[$n]}" "Cost Management Contributor" "$LZ/resourceGroups/rg-spoke-team$n"  # Lab 2B budget
  assign_role "${G_ENG[$n]}" "Contributor" "$LZ/resourceGroups/rg-spoke-team$n"
  assign_role "${G_ENG[$n]}" "Contributor" "$LZ/resourceGroups/rg-arc-team$n"
  assign_role "${G_ENG[$n]}" "Resource Policy Contributor" "$LZ"                          # Lab 2A custom policy
  assign_role "${G_ENG[$n]}" "Network Contributor" "$LZ/resourceGroups/NetworkWatcherRG"  # Lab 3B next hop
  assign_role "${G_ENG[$n]}" "Monitoring Contributor" "$LAW_SCOPE"                        # Lab 4B DCR/alert

  log "Tim $n: PIM eligibility (role Azure resource)"
  eligible_azure_role "${G_ENG[$n]}" "Network Contributor" "$CONN_RG" "$SUB_CONNECTIVITY"
  eligible_azure_role "${G_ENG[$n]}" "Role Based Access Control Administrator" "$LZ/resourceGroups/rg-spoke-team$n" "$SUB_LANDINGZONE"
done

cat <<'EOF'

LANGKAH MANUAL (tidak bisa diotomasi dengan aman di script ini):
 1. Approval PIM: Entra admin center > ID Governance > Privileged Identity Management > Azure resources
    > pilih rg-conn dan setiap rg-spoke-teamN > Settings > role (Network Contributor /
    Role Based Access Control Administrator) > Edit > centang "Require approval to activate"
    > approver = grp-teamN-managers.
 2. Activation maximum duration: 2–4 jam untuk role lab.
 3. Buat 2 akun break-glass trainer (cloud-only, Global Administrator) dan kecualikan dari Conditional Access.
EOF
log "Selesai."
