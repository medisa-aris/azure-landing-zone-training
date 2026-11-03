// Modul workload landing zone (spoke) untuk Lab 5A.
// Membuat VNet + route table ke Azure Firewall + peering dua arah ke hub.
// Nilai platform (hub, firewall) dibaca dari config/platform.json agar tim cukup mengisi parameter tim.
targetScope = 'resourceGroup'

@description('Nama tim, contoh team1.')
param teamName string

@description('Nama spoke, contoh spoke2.')
param spokeName string

@allowed(['indonesiacentral'])
param location string = 'indonesiacentral'

@description('Address space spoke, contoh 10.0.21.0/24 untuk tim 1.')
param addressPrefix string

@description('Tag wajib: CostCenter, Owner, Environment.')
param tags object

var platform = loadJsonContent('../../config/platform.json')
var vnetName = 'vnet-${spokeName}-${teamName}'
var hubVnetId = resourceId(platform.hubSubscriptionId, platform.hubResourceGroup, 'Microsoft.Network/virtualNetworks', platform.hubVnetName)

resource rt 'Microsoft.Network/routeTables@2023-11-01' = {
  name: 'rt-${spokeName}-${teamName}'
  location: location
  tags: tags
  properties: {
    disableBgpRoutePropagation: false
    routes: [
      {
        name: 'default-to-fw'
        properties: {
          addressPrefix: '0.0.0.0/0'
          nextHopType: 'VirtualAppliance'
          nextHopIpAddress: platform.firewallPrivateIp
        }
      }
    ]
  }
}

resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' = {
  name: vnetName
  location: location
  tags: tags
  properties: {
    addressSpace: { addressPrefixes: [addressPrefix] }
    subnets: [
      {
        name: 'snet-app'
        properties: {
          addressPrefix: cidrSubnet(addressPrefix, 26, 0)
          routeTable: { id: rt.id }
        }
      }
    ]
  }
}

// Sisi hub harus ada lebih dulu (allow gateway transit) sebelum sisi spoke memakai remote gateway.
module hubSide 'hub-peering.bicep' = {
  name: 'hub-peering-${spokeName}-${teamName}'
  scope: resourceGroup(platform.hubSubscriptionId, platform.hubResourceGroup)
  params: {
    hubVnetName: platform.hubVnetName
    peeringName: 'hub-to-${spokeName}-${teamName}'
    remoteVnetId: vnet.id
  }
}

resource spokeToHub 'Microsoft.Network/virtualNetworks/virtualNetworkPeerings@2023-11-01' = {
  parent: vnet
  name: '${spokeName}-${teamName}-to-hub'
  dependsOn: [hubSide]
  properties: {
    remoteVirtualNetwork: { id: hubVnetId }
    allowVirtualNetworkAccess: true
    allowForwardedTraffic: true
    useRemoteGateways: true
  }
}

output vnetId string = vnet.id
