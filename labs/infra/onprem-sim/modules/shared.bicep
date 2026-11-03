// VNet bersama + Azure Bastion untuk mengakses semua data center simulasi melalui peering.
// Range 172.31.255.0/24 sengaja di luar 172.16.0.0/16 agar tidak bentrok dengan tim mana pun (termasuk tim 0).
targetScope = 'resourceGroup'

param location string
param tags object

resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' = {
  name: 'vnet-onprem-shared'
  location: location
  tags: tags
  properties: {
    addressSpace: { addressPrefixes: ['172.31.255.0/24'] }
    subnets: [
      { name: 'AzureBastionSubnet', properties: { addressPrefix: '172.31.255.0/26' } }
    ]
  }
}

resource pip 'Microsoft.Network/publicIPAddresses@2023-11-01' = {
  name: 'pip-bas-onprem'
  location: location
  tags: tags
  sku: { name: 'Standard' }
  properties: { publicIPAllocationMethod: 'Static' }
}

// SKU Basic mendukung koneksi ke VM di VNet yang di-peer.
resource bastion 'Microsoft.Network/bastionHosts@2023-11-01' = {
  name: 'bas-onprem'
  location: location
  tags: tags
  sku: { name: 'Basic' }
  properties: {
    ipConfigurations: [
      {
        name: 'ipconfig'
        properties: {
          subnet: { id: '${vnet.id}/subnets/AzureBastionSubnet' }
          publicIPAddress: { id: pip.id }
        }
      }
    ]
  }
}

output vnetId string = vnet.id
output vnetName string = vnet.name
