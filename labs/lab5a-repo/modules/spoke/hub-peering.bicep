// Sisi hub dari peering spoke (dideploy di rg-conn).
targetScope = 'resourceGroup'

param hubVnetName string
param peeringName string
param remoteVnetId string

resource hub 'Microsoft.Network/virtualNetworks@2023-11-01' existing = {
  name: hubVnetName
}

resource peering 'Microsoft.Network/virtualNetworks/virtualNetworkPeerings@2023-11-01' = {
  parent: hub
  name: peeringName
  properties: {
    remoteVirtualNetwork: { id: remoteVnetId }
    allowVirtualNetworkAccess: true
    allowForwardedTraffic: true
    allowGatewayTransit: true
  }
}
