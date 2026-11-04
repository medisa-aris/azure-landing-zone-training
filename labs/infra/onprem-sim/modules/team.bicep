// Data center simulasi satu tim: vnet-onprem-teamN 172.16.N.0/24
//   snet-servers 172.16.N.0/25   : DC01 (.4), APP01 (.5) – default route ke RTR01
//   snet-edge    172.16.N.128/27 : RTR01 (.132) dengan IP publik = internet edge + perangkat VPN
// VNet baru tidak punya akses internet implisit; server keluar ke internet melalui NAT di RTR01.
targetScope = 'resourceGroup'

@minValue(0)
@maxValue(9)
param teamNumber int

param location string
param hubGatewayPublicIp string
param azureAddressSpace string
param adminUsername string

@secure()
param adminPassword string

param shutdownTime string
param timeZone string
param tags object

var n = teamNumber
var base = '172.16.${n}'
var teamSubnet = '${base}.0/24'
var dcIp = '${base}.4'
var appIp = '${base}.5'
var rtrIp = '${base}.132'
var ikeSource = empty(hubGatewayPublicIp) ? 'Internet' : hubGatewayPublicIp

var cloudInit = replace(replace(loadTextContent('../cloud-init/rtr01.yaml'), '__TEAM_SUBNET__', teamSubnet), '__AZURE_SPACE__', azureAddressSpace)

// ---------------------------------------------------------------- NSG
resource nsgEdge 'Microsoft.Network/networkSecurityGroups@2023-11-01' = {
  name: 'nsg-snet-edge-team${n}'
  location: location
  tags: tags
  properties: {
    securityRules: [
      {
        name: 'allow-ike-udp500'
        properties: {
          priority: 100
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Udp'
          sourceAddressPrefix: ikeSource
          sourcePortRange: '*'
          destinationAddressPrefix: '*'
          destinationPortRange: '500'
        }
      }
      {
        name: 'allow-ike-natt-udp4500'
        properties: {
          priority: 110
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Udp'
          sourceAddressPrefix: ikeSource
          sourcePortRange: '*'
          destinationAddressPrefix: '*'
          destinationPortRange: '4500'
        }
      }
      {
        name: 'allow-azure-via-tunnel'
        properties: {
          priority: 120
          direction: 'Inbound'
          access: 'Allow'
          protocol: '*'
          sourceAddressPrefix: azureAddressSpace
          sourcePortRange: '*'
          destinationAddressPrefix: '*'
          destinationPortRange: '*'
        }
      }
    ]
  }
}

resource nsgServers 'Microsoft.Network/networkSecurityGroups@2023-11-01' = {
  name: 'nsg-snet-servers-team${n}'
  location: location
  tags: tags
  properties: {
    securityRules: [
      {
        name: 'allow-azure-landingzone'
        properties: {
          priority: 100
          direction: 'Inbound'
          access: 'Allow'
          protocol: '*'
          sourceAddressPrefix: azureAddressSpace
          sourcePortRange: '*'
          destinationAddressPrefix: '*'
          destinationPortRange: '*'
        }
      }
    ]
  }
}

// ---------------------------------------------------------------- Route table: server -> RTR01
resource rt 'Microsoft.Network/routeTables@2023-11-01' = {
  name: 'rt-snet-servers-team${n}'
  location: location
  tags: tags
  properties: {
    disableBgpRoutePropagation: true
    routes: [
      {
        name: 'default-to-rtr01'
        properties: { addressPrefix: '0.0.0.0/0', nextHopType: 'VirtualAppliance', nextHopIpAddress: rtrIp }
      }
      {
        name: 'azure-to-rtr01'
        properties: { addressPrefix: azureAddressSpace, nextHopType: 'VirtualAppliance', nextHopIpAddress: rtrIp }
      }
    ]
  }
}

// ---------------------------------------------------------------- VNet
// DNS VNet diubah ke DC01 (172.16.N.4) oleh configure-onprem.sh setelah promosi domain.
resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' = {
  name: 'vnet-onprem-team${n}'
  location: location
  tags: tags
  properties: {
    addressSpace: { addressPrefixes: [teamSubnet] }
    subnets: [
      {
        name: 'snet-servers'
        properties: {
          addressPrefix: '${base}.0/25'
          networkSecurityGroup: { id: nsgServers.id }
          routeTable: { id: rt.id }
        }
      }
      {
        name: 'snet-edge'
        properties: {
          addressPrefix: '${base}.128/27'
          networkSecurityGroup: { id: nsgEdge.id }
        }
      }
    ]
  }
}

// ---------------------------------------------------------------- RTR01 (Ubuntu + strongSwan)
resource pipRtr 'Microsoft.Network/publicIPAddresses@2023-11-01' = {
  name: 'pip-rtr01-team${n}'
  location: location
  tags: tags
  sku: { name: 'Standard' }
  properties: { publicIPAllocationMethod: 'Static' }
}

resource nicRtr 'Microsoft.Network/networkInterfaces@2023-11-01' = {
  name: 'nic-rtr01-team${n}'
  location: location
  tags: tags
  properties: {
    enableIPForwarding: true
    dnsSettings: { dnsServers: ['168.63.129.16'] }
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          privateIPAllocationMethod: 'Static'
          privateIPAddress: rtrIp
          subnet: { id: '${vnet.id}/subnets/snet-edge' }
          publicIPAddress: { id: pipRtr.id }
        }
      }
    ]
  }
}

resource rtr 'Microsoft.Compute/virtualMachines@2024-03-01' = {
  name: 'rtr01-team${n}'
  location: location
  tags: tags
  properties: {
    hardwareProfile: { vmSize: 'Standard_B1s' }
    osProfile: {
      computerName: 'rtr01'
      adminUsername: adminUsername
      adminPassword: adminPassword
      customData: base64(cloudInit)
      linuxConfiguration: { disablePasswordAuthentication: false }
    }
    storageProfile: {
      imageReference: {
        publisher: 'Canonical'
        offer: '0001-com-ubuntu-server-jammy'
        sku: '22_04-lts-gen2'
        version: 'latest'
      }
      osDisk: { createOption: 'FromImage', managedDisk: { storageAccountType: 'StandardSSD_LRS' } }
    }
    networkProfile: { networkInterfaces: [{ id: nicRtr.id }] }
  }
}

// ---------------------------------------------------------------- DC01 dan APP01 (Windows Server 2022)
var windowsVms = [
  { name: 'dc01-team${n}', computerName: 'dc01', ip: dcIp, size: 'Standard_B2ms' }
  { name: 'app01-team${n}', computerName: 'app01', ip: appIp, size: 'Standard_B2s' }
]

resource nicWin 'Microsoft.Network/networkInterfaces@2023-11-01' = [for w in windowsVms: {
  name: 'nic-${w.name}'
  location: location
  tags: tags
  properties: {
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          privateIPAllocationMethod: 'Static'
          privateIPAddress: w.ip
          subnet: { id: '${vnet.id}/subnets/snet-servers' }
        }
      }
    ]
  }
}]

// Catatan: jangan menambahkan VM extension ke APP01 – Arc evaluation mensyaratkan tidak ada extension.
resource win 'Microsoft.Compute/virtualMachines@2024-03-01' = [for (w, i) in windowsVms: {
  name: w.name
  location: location
  tags: tags
  properties: {
    hardwareProfile: { vmSize: w.size }
    osProfile: {
      computerName: w.computerName
      adminUsername: adminUsername
      adminPassword: adminPassword
      windowsConfiguration: { provisionVMAgent: true, enableAutomaticUpdates: true, timeZone: timeZone }
    }
    storageProfile: {
      imageReference: {
        publisher: 'MicrosoftWindowsServer'
        offer: 'WindowsServer'
        sku: '2022-datacenter-g2'
        version: 'latest'
      }
      osDisk: { createOption: 'FromImage', managedDisk: { storageAccountType: 'StandardSSD_LRS' } }
    }
    networkProfile: { networkInterfaces: [{ id: nicWin[i].id }] }
  }
}]

// ---------------------------------------------------------------- Auto-shutdown 16:30 WIB
resource shutdownRtr 'Microsoft.DevTestLab/schedules@2018-09-15' = {
  name: 'shutdown-computevm-${rtr.name}'
  location: location
  properties: {
    status: 'Enabled'
    taskType: 'ComputeVmShutdownTask'
    dailyRecurrence: { time: shutdownTime }
    timeZoneId: timeZone
    targetResourceId: rtr.id
  }
}

resource shutdownWin 'Microsoft.DevTestLab/schedules@2018-09-15' = [for (w, i) in windowsVms: {
  name: 'shutdown-computevm-${w.name}'
  location: location
  properties: {
    status: 'Enabled'
    taskType: 'ComputeVmShutdownTask'
    dailyRecurrence: { time: shutdownTime }
    timeZoneId: timeZone
    targetResourceId: win[i].id
  }
}]

output vnetId string = vnet.id
output vnetName string = vnet.name
output rtr01PublicIp string = pipRtr.properties.ipAddress
output dc01PrivateIp string = dcIp
output app01PrivateIp string = appIp
