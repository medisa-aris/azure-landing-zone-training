#!/usr/bin/env bash
# Fungsi bersama untuk script lab. Dipanggil dengan: source "$(dirname "$0")/lib.sh"
set -euo pipefail

INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PS_DIR="$INFRA_DIR/scripts/ps"
OUT_DIR="$INFRA_DIR/config"
LOG_DIR="$INFRA_DIR/logs"
ENV_FILE="${LAB_ENV:-$INFRA_DIR/config/lab.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "File konfigurasi tidak ditemukan: $ENV_FILE"
  echo "Salin dulu: cp $INFRA_DIR/config/lab.env.example $INFRA_DIR/config/lab.env"
  exit 1
fi
# shellcheck source=/dev/null
source "$ENV_FILE"
mkdir -p "$LOG_DIR"

for tool in az jq; do
  command -v "$tool" >/dev/null || { echo "Perintah '$tool' tidak ditemukan (gunakan Azure Cloud Shell)."; exit 1; }
done

log() { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

# Daftar tim sebagai array JSON, contoh: [0,1,2]
teams_json() { printf '%s\n' $TEAMS | jq -s -c 'map(tonumber)'; }

new_guid() { cat /proc/sys/kernel/random/uuid; }

# Jalankan script PowerShell di VM Windows melalui Run Command.
# run_ps <subscription> <resource-group> <vm> <file.ps1> [Nama=Nilai ...]
run_ps() {
  local sub=$1 rg=$2 vm=$3 file=$4
  shift 4
  local args=(vm run-command invoke --subscription "$sub" -g "$rg" -n "$vm"
    --command-id RunPowerShellScript --scripts @"$file" --query "value[].message" -o tsv)
  if [[ $# -gt 0 ]]; then args+=(--parameters "$@"); fi
  az "${args[@]}"
}

# Jalankan perintah shell di VM Linux melalui Run Command.
# run_sh <subscription> <resource-group> <vm> "<script>"
run_sh() {
  az vm run-command invoke --subscription "$1" -g "$2" -n "$3" \
    --command-id RunShellScript --scripts "$4" --query "value[].message" -o tsv
}

# Baca nilai output dari file JSON hasil deployment: out_value <file> <nama-output>
out_value() { jq -r --arg k "$2" '.[$k].value' "$OUT_DIR/$1"; }

confirm() {
  local prompt=$1 expected=$2 answer
  read -r -p "$prompt Ketik '$expected' untuk melanjutkan: " answer
  [[ "$answer" == "$expected" ]] || { echo "Dibatalkan."; exit 1; }
}
