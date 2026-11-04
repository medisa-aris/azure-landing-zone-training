<#
  Promosi DC01 menjadi domain controller forest baru (teamN.corp.local).
  Dijalankan oleh configure-onprem.sh melalui `az vm run-command invoke`.
  Tidak me-restart otomatis: script pemanggil yang me-restart VM (agar run-command bisa selesai).
#>
param(
  [Parameter(Mandatory)][string]$DomainName,
  [Parameter(Mandatory)][string]$NetbiosName,
  [Parameter(Mandatory)][string]$SafeModePassword
)
$ErrorActionPreference = 'Stop'

# DomainRole 4 = backup DC, 5 = primary DC
if ((Get-CimInstance Win32_ComputerSystem).DomainRole -ge 4) {
  Write-Output "SKIP: sudah menjadi domain controller untuk $((Get-CimInstance Win32_ComputerSystem).Domain)"
  return
}

Install-WindowsFeature AD-Domain-Services -IncludeManagementTools | Out-Null
Import-Module ADDSDeployment

$sm = ConvertTo-SecureString $SafeModePassword -AsPlainText -Force
Install-ADDSForest `
  -DomainName $DomainName `
  -DomainNetbiosName $NetbiosName `
  -SafeModeAdministratorPassword $sm `
  -InstallDns `
  -NoRebootOnCompletion `
  -Force `
  -WarningAction SilentlyContinue | Out-Null

Write-Output "OK: promosi $DomainName selesai, VM perlu di-restart"
