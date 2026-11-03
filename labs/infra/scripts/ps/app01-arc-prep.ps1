<#
  Menyiapkan APP01 (Azure VM) agar bisa di-onboard ke Azure Arc untuk EVALUASI/TRAINING.
  Mengikuti Microsoft Learn: "Evaluate Azure Arc-enabled servers on an Azure virtual machine".
    1. VM extensions sudah dihapus oleh script pemanggil (configure-onprem.sh) sebelum script ini.
    2. Set MSFT_ARC_TEST=true (Machine).
    3. Blokir akses ke IMDS 169.254.169.254 dan 169.254.169.253.
    4. Matikan Azure VM Guest Agent – dijadwalkan 2 menit kemudian, karena run-command yang
       menjalankan script ini bergantung pada guest agent.
  PERINGATAN: setelah ini, Run Command dan VM extension tidak bisa dipakai lagi pada APP01.
  JANGAN dipakai untuk VM produksi.
#>
$ErrorActionPreference = 'Stop'

# Ambil DNS baru (DC01) dari DHCP
ipconfig /renew | Out-Null

[Environment]::SetEnvironmentVariable('MSFT_ARC_TEST', 'true', 'Machine')

if (-not (Get-NetFirewallRule -Name 'BlockAzureIMDS' -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -Name 'BlockAzureIMDS' -DisplayName 'Block access to Azure IMDS' `
    -Enabled True -Profile Any -Direction Outbound -Action Block `
    -RemoteAddress 169.254.169.254, 169.254.169.253 | Out-Null
}

$cmd = 'Set-Service WindowsAzureGuestAgent -StartupType Disabled; Stop-Service WindowsAzureGuestAgent -Force'
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"$cmd`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2)
Register-ScheduledTask -TaskName 'LabDisableAzureGuestAgent' -Action $action -Trigger $trigger `
  -User 'SYSTEM' -RunLevel Highest -Force | Out-Null

Write-Output "OK: MSFT_ARC_TEST=$([Environment]::GetEnvironmentVariable('MSFT_ARC_TEST','Machine')); IMDS diblokir; guest agent dimatikan dalam 2 menit"
