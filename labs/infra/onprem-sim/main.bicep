// Data center simulasi untuk lab hybrid (subscription terpisah, region terpisah, TANPA peering ke landing zone).
// - rg-onprem-shared : VNet 172.31.255.0/24 + Azure Bastion (akses peserta ke DC01/APP01/RTR01)
// - rg-onprem-teamN  : vnet-onprem-teamN 172.16.N.0/24 dengan DC01, APP01, RTR01
// Peering hanya shared <-> tim (untuk Bastion). Tim tidak saling terhubung dan tidak terhubung ke Azure landing zone.
targetScope = 'subscription'

param location string = 'southeastasia'

@description('Nomor tim, contoh [0, 1, 2, 3].')
param teams array

@description('IP publik VPN gateway hub (vgw-hub). Kosongkan untuk mengizinkan UDP 500/4500 dari Internet.')
param hubGatewayPublicIp string = ''

param azureAddressSpace string = '10.0.0.0/16'
param adminUsername string = 'labadmin'

@secure()
param adminPassword string

param shutdownTime string = '1630'
param timeZone string = 'SE Asia Standard Time'

param tags object = {
  Environment: 'training'
  CostCenter: 'CC-TRAINING-ONPREMSIM'
  Owner: 'platform-team'
}

resource rgShared 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'rg-onprem-shared'
  location: location
  tags: tags
}

resource rgTeam 'Microsoft.Resources/resourceGroups@2024-03-01' = [for n in teams: {
  name: 'rg-onprem-team${n}'
  location: location
  tags: tags
}]

module shared 'modules/shared.bicep' = {
  name: 'onprem-shared'
  scope: rgShared
  params: {
    location: location
    tags: tags
  }
}

module team 'modules/team.bicep' = [for (n, i) in teams: {
  name: 'onprem-team${n}'
  scope: rgTeam[i]
  params: {
    teamNumber: n
    location: location
    hubGatewayPublicIp: hubGatewayPublicIp
    azureAddressSpace: azureAddressSpace
    adminUsername: adminUsername
    adminPassword: adminPassword
    shutdownTime: shutdownTime
    timeZone: timeZone
    tags: tags
  }
}]

module peerSharedToTeam 'modules/peering.bicep' = [for (n, i) in teams: {
  name: 'peer-shared-to-team${n}'
  scope: rgShared
  params: {
    localVnetName: shared.outputs.vnetName
    peeringName: 'shared-to-team${n}'
    remoteVnetId: team[i].outputs.vnetId
  }
}]

module peerTeamToShared 'modules/peering.bicep' = [for (n, i) in teams: {
  name: 'peer-team${n}-to-shared'
  scope: rgTeam[i]
  params: {
    localVnetName: team[i].outputs.vnetName
    peeringName: 'team${n}-to-shared'
    remoteVnetId: shared.outputs.vnetId
  }
}]

output teams array = [for (n, i) in teams: {
  team: n
  rtr01PublicIp: team[i].outputs.rtr01PublicIp
  dc01PrivateIp: team[i].outputs.dc01PrivateIp
  app01PrivateIp: team[i].outputs.app01PrivateIp
}]
