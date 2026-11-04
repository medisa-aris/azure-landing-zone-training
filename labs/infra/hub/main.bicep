// Hub network untuk training (subscription Connectivity, resource group rg-conn).
// Dipakai jika ALZ IaC Accelerator dideploy dengan connectivity "none".
// Nama dan alamat IP mengikuti Lab Guide bagian 2.1.
targetScope = 'resourceGroup'

@description('Region hub.')
param location string = 'indonesiacentral'

@description('Resource ID Log Analytics workspace pusat (law-platform-idc).')
param logAnalyticsWorkspaceId string

@description('Address space Azure landing zone (semua spoke).')
param azureAddressSpace string = '10.0.0.0/16'

@description('Address space semua data center simulasi.')
param onpremAddressSpace string = '172.16.0.0/16'

@description('Deploy VPN gateway (memakan waktu 45 menit atau lebih).')
param deployVpnGateway bool = true

param tags object = {
  Environment: 'training'
  CostCenter: 'CC-TRAINING-PLATFORM'
  Owner: 'platform-team'
}

var zones = ['1', '2', '3']

// ---------------------------------------------------------------- VNet
resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' = {
  name: 'vnet-hub'
  location: location
  tags: tags
  properties: {
    addressSpace: { addressPrefixes: ['10.0.0.0/22'] }
    subnets: [
      { name: 'GatewaySubnet', properties: { addressPrefix: '10.0.0.0/26' } }
      { name: 'AzureFirewallSubnet', properties: { addressPrefix: '10.0.1.0/26' } }
      {
        name: 'snet-dns-inbound'
        properties: {
          addressPrefix: '10.0.2.0/28'
          delegations: [{ name: 'dnsResolvers', properties: { serviceName: 'Microsoft.Network/dnsResolvers' } }]
        }
      }
      {
        name: 'snet-dns-outbound'
        properties: {
          addressPrefix: '10.0.2.16/28'
          delegations: [{ name: 'dnsResolvers', properties: { serviceName: 'Microsoft.Network/dnsResolvers' } }]
        }
      }
      { name: 'AzureBastionSubnet', properties: { addressPrefix: '10.0.3.0/26' } }
    ]
  }
}

// ---------------------------------------------------------------- Azure Firewall (IP privat pertama di subnet = 10.0.1.4)
resource fwPip 'Microsoft.Network/publicIPAddresses@2023-11-01' = {
  name: 'pip-fw-hub'
  location: location
  tags: tags
  sku: { name: 'Standard' }
  zones: zones
  properties: { publicIPAllocationMethod: 'Static' }
}

resource fwPolicy 'Microsoft.Network/firewallPolicies@2023-11-01' = {
  name: 'fwpol-hub'
  location: location
  tags: tags
  properties: {
    sku: { tier: 'Standard' }
    threatIntelMode: 'Alert'
  }
}

resource fwRules 'Microsoft.Network/firewallPolicies/ruleCollectionGroups@2023-11-01' = {
  parent: fwPolicy
  name: 'rcg-lab'
  properties: {
    priority: 200
    ruleCollections: [
      {
        ruleCollectionType: 'FirewallPolicyFilterRuleCollection'
        name: 'net-hybrid'
        priority: 100
        action: { type: 'Allow' }
        rules: [
          {
            ruleType: 'NetworkRule'
            name: 'onprem-azure-both-ways'
            ipProtocols: ['Any']
            sourceAddresses: [onpremAddressSpace, azureAddressSpace]
            destinationAddresses: [azureAddressSpace, onpremAddressSpace]
            destinationPorts: ['*']
          }
        ]
      }
      {
        ruleCollectionType: 'FirewallPolicyFilterRuleCollection'
        name: 'app-internet-lab'
        priority: 200
        action: { type: 'Allow' }
        rules: [
          {
            ruleType: 'ApplicationRule'
            name: 'allow-lab-fqdns'
            sourceAddresses: [azureAddressSpace]
            protocols: [
              { protocolType: 'Https', port: 443 }
              { protocolType: 'Http', port: 80 }
            ]
            targetFqdns: ['*.microsoft.com', '*.azure.com', '*.windows.net', '*.ubuntu.com']
          }
        ]
      }
    ]
  }
}

resource fw 'Microsoft.Network/azureFirewalls@2023-11-01' = {
  name: 'fw-hub'
  location: location
  tags: tags
  zones: zones
  dependsOn: [fwRules]
  properties: {
    sku: { name: 'AZFW_VNet', tier: 'Standard' }
    firewallPolicy: { id: fwPolicy.id }
    ipConfigurations: [
      {
        name: 'ipconfig'
        properties: {
          subnet: { id: '${vnet.id}/subnets/AzureFirewallSubnet' }
          publicIPAddress: { id: fwPip.id }
        }
      }
    ]
  }
}

// Resource-specific tables (AZFWApplicationRule, AZFWNetworkRule) untuk Lab 3B
resource fwDiag 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'diag-law'
  scope: fw
  properties: {
    workspaceId: logAnalyticsWorkspaceId
    logAnalyticsDestinationType: 'Dedicated'
    logs: [{ categoryGroup: 'allLogs', enabled: true }]
  }
}

// ---------------------------------------------------------------- VPN gateway
resource gwPip 'Microsoft.Network/publicIPAddresses@2023-11-01' = if (deployVpnGateway) {
  name: 'pip-vgw-hub'
  location: location
  tags: tags
  sku: { name: 'Standard' }
  zones: zones
  properties: { publicIPAllocationMethod: 'Static' }
}

resource vgw 'Microsoft.Network/virtualNetworkGateways@2023-11-01' = if (deployVpnGateway) {
  name: 'vgw-hub'
  location: location
  tags: tags
  properties: {
    gatewayType: 'Vpn'
    vpnType: 'RouteBased'
    vpnGatewayGeneration: 'Generation2'
    sku: { name: 'VpnGw1AZ', tier: 'VpnGw1AZ' }
    activeActive: false
    enableBgp: false
    ipConfigurations: [
      {
        name: 'default'
        properties: {
          privateIPAllocationMethod: 'Dynamic'
          subnet: { id: '${vnet.id}/subnets/GatewaySubnet' }
          publicIPAddress: { id: gwPip.id }
        }
      }
    ]
  }
}

// ---------------------------------------------------------------- DNS Private Resolver + ruleset
resource dnspr 'Microsoft.Network/dnsResolvers@2022-07-01' = {
  name: 'dnspr-hub'
  location: location
  tags: tags
  properties: { virtualNetwork: { id: vnet.id } }
}

resource inbound 'Microsoft.Network/dnsResolvers/inboundEndpoints@2022-07-01' = {
  parent: dnspr
  name: 'in-hub'
  location: location
  properties: {
    ipConfigurations: [
      {
        privateIpAllocationMethod: 'Static'
        privateIpAddress: '10.0.2.4'
        subnet: { id: '${vnet.id}/subnets/snet-dns-inbound' }
      }
    ]
  }
}

resource outbound 'Microsoft.Network/dnsResolvers/outboundEndpoints@2022-07-01' = {
  parent: dnspr
  name: 'out-hub'
  location: location
  properties: { subnet: { id: '${vnet.id}/subnets/snet-dns-outbound' } }
}

resource ruleset 'Microsoft.Network/dnsForwardingRulesets@2022-07-01' = {
  name: 'frs-hub'
  location: location
  tags: tags
  properties: { dnsResolverOutboundEndpoints: [{ id: outbound.id }] }
}

resource rulesetLinkHub 'Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks@2022-07-01' = {
  parent: ruleset
  name: 'link-vnet-hub'
  properties: { virtualNetwork: { id: vnet.id } }
}

// ---------------------------------------------------------------- Private DNS zone untuk blob
resource pdzBlob 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: 'privatelink.blob.${environment().suffixes.storage}'
  location: 'global'
  tags: tags
}

resource pdzBlobLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: pdzBlob
  name: 'link-vnet-hub'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: { id: vnet.id }
  }
}

output hubVnetId string = vnet.id
output firewallPrivateIp string = fw.properties.ipConfigurations[0].properties.privateIPAddress
output vpnGatewayPublicIp string = deployVpnGateway ? gwPip!.properties.ipAddress : ''
output dnsInboundIp string = inbound.properties.ipConfigurations[0].privateIpAddress
output rulesetId string = ruleset.id
output privateDnsZoneBlobId string = pdzBlob.id
