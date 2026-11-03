<#
  Konfigurasi DC01 setelah restart:
  - DNS forwarder ke Azure DNS (resolusi internet)
  - KDS root key (dibutuhkan installer Cloud Sync untuk membuat gMSA)
  - OU Sync-Users + user contoh (Lab 3C)
  - labadmin di Domain Admins / Enterprise Admins
  - C:\LabFiles (+ unduh installer agent Cloud Sync jika URL diberikan)
#>
param(
  [Parameter(Mandatory)][string]$DomainName,
  [Parameter(Mandatory)][string]$UserPassword,
  [string]$AdminUser = 'labadmin',
  [string]$AgentUrl = ''
)
$ErrorActionPreference = 'Stop'

# Tunggu AD Web Services siap (maks. 10 menit setelah reboot)
$deadline = (Get-Date).AddMinutes(10)
while ($true) {
  try { Import-Module ActiveDirectory; $dom = Get-ADDomain; break }
  catch {
    if ((Get-Date) -gt $deadline) { throw "AD belum siap setelah 10 menit: $_" }
    Start-Sleep -Seconds 15
  }
}
$dn = $dom.DistinguishedName

# DNS forwarder: 168.63.129.16 hanya dapat dijangkau dari dalam VNet Azure (simulasi ISP DNS)
Set-DnsServerForwarder -IPAddress 168.63.129.16 -PassThru | Out-Null

# KDS root key, efektif mundur 10 jam agar gMSA bisa langsung dibuat (khusus lab)
if (-not (Get-KdsRootKey)) {
  Add-KdsRootKey -EffectiveTime ((Get-Date).AddHours(-10)) | Out-Null
}

# OU dan user contoh
$ouPath = "OU=Sync-Users,$dn"
if (-not (Get-ADOrganizationalUnit -Filter "Name -eq 'Sync-Users'" -SearchBase $dn -ErrorAction SilentlyContinue)) {
  New-ADOrganizationalUnit -Name 'Sync-Users' -Path $dn -ProtectedFromAccidentalDeletion $false
}
$pw = ConvertTo-SecureString $UserPassword -AsPlainText -Force
$users = @(
  @{ Given = 'Budi'; Sur = 'Santoso' },
  @{ Given = 'Siti'; Sur = 'Rahma' },
  @{ Given = 'Andi'; Sur = 'Wijaya' }
)
foreach ($u in $users) {
  $sam = ("{0}.{1}" -f $u.Given, $u.Sur).ToLower()
  if (-not (Get-ADUser -Filter "SamAccountName -eq '$sam'" -ErrorAction SilentlyContinue)) {
    New-ADUser -Name "$($u.Given) $($u.Sur)" -GivenName $u.Given -Surname $u.Sur `
      -SamAccountName $sam -UserPrincipalName "$sam@$DomainName" -Path $ouPath `
      -AccountPassword $pw -Enabled $true -PasswordNeverExpires $true
  }
}

# labadmin (akun Administrator VM yang di-rename Azure) dipastikan Domain/Enterprise Admin
foreach ($g in 'Domain Admins', 'Enterprise Admins') {
  $members = Get-ADGroupMember $g | Select-Object -ExpandProperty SamAccountName
  if ($members -notcontains $AdminUser) { Add-ADGroupMember -Identity $g -Members $AdminUser }
}

# Folder lab + installer agent Cloud Sync
New-Item -ItemType Directory -Path 'C:\LabFiles' -Force | Out-Null
if ($AgentUrl) {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -Uri $AgentUrl -OutFile 'C:\LabFiles\AADConnectProvisioningAgentSetup.exe' -UseBasicParsing
}

Write-Output ("OK: domain {0}; OU Sync-Users berisi {1} user; KDS={2}; installer={3}" -f `
  $dom.DNSRoot, (Get-ADUser -Filter * -SearchBase $ouPath).Count, [bool](Get-KdsRootKey), `
  (Test-Path 'C:\LabFiles\AADConnectProvisioningAgentSetup.exe'))
