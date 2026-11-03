// Satu sisi VNet peering (dipakai untuk shared <-> tim).
targetScope = 'resourceGroup'

param localVnetName string
param peeringName string
param remoteVnetId string

resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' existing = {
  name: localVnetName
}

resource peering 'Microsoft.Network/virtualNetworks/virtualNetworkPeerings@2023-11-01' = {
  parent: vnet
  name: peeringName
  properties: {
    remoteVirtualNetwork: { id: remoteVnetId }
    allowVirtualNetworkAccess: true
    allowForwardedTraffic: false
    allowGatewayTransit: false
    useRemoteGateways: false
  }
}
