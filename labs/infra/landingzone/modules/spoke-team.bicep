// Spoke satu tim: vnet-spoke-teamN 10.0.(10+N).0/24
targetScope = 'resourceGroup'

@minValue(0)
@maxValue(9)
param teamNumber int

param location string
param privateDnsZoneBlobId string
param adminUsername string

@secure()
param adminPassword string

param alertEmail string
param onpremAddressSpace string = '172.16.0.0/16'
param shutdownTime string = '1630'
param timeZone string = 'SE Asia Standard Time'

var n = teamNumber
var prefix = '10.0.${10 + n}'
var vmName = 'vm-app-team${n}'

// Tag sengaja tidak lengkap pada sebagian resource agar Lab 2A dan 2B punya temuan nyata.
var baseTags = {
  Environment: 'training'
}

resource nsgApp 'Microsoft.Network/networkSecurityGroups@2023-11-01' = {
  name: 'nsg-snet-app-team${n}'
  location: location
  tags: baseTags
  properties: {
    securityRules: [
      {
        name: 'allow-onprem-inbound'
        properties: {
          priority: 100
          direction: 'Inbound'
          access: 'Allow'
          protocol: '*'
          sourceAddressPrefix: onpremAddressSpace
          sourcePortRange: '*'
          destinationAddressPrefix: '*'
          destinationPortRange: '*'
        }
      }
    ]
  }
}

resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' = {
  name: 'vnet-spoke-team${n}'
  location: location
  tags: baseTags
  properties: {
    addressSpace: { addressPrefixes: ['${prefix}.0/24'] }
    subnets: [
      {
        name: 'snet-app'
        properties: {
          addressPrefix: '${prefix}.0/26'
          networkSecurityGroup: { id: nsgApp.id }
        }
      }
      {
        name: 'snet-pe'
        properties: { addressPrefix: '${prefix}.64/27' }
      }
    ]
  }
}

// ---------------------------------------------------------------- VM aplikasi (Ubuntu, tanpa public IP)
resource nic 'Microsoft.Network/networkInterfaces@2023-11-01' = {
  name: 'nic-${vmName}'
  location: location
  tags: baseTags
  properties: {
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          privateIPAllocationMethod: 'Static'
          privateIPAddress: '${prefix}.4'
          subnet: { id: '${vnet.id}/subnets/snet-app' }
        }
      }
    ]
  }
}

resource vm 'Microsoft.Compute/virtualMachines@2024-03-01' = {
  name: vmName
  location: location
  tags: baseTags
  properties: {
    hardwareProfile: { vmSize: 'Standard_B1s' }
    osProfile: {
      computerName: vmName
      adminUsername: adminUsername
      adminPassword: adminPassword
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
    networkProfile: { networkInterfaces: [{ id: nic.id }] }
  }
}

resource vmShutdown 'Microsoft.DevTestLab/schedules@2018-09-15' = {
  name: 'shutdown-computevm-${vmName}'
  location: location
  properties: {
    status: 'Enabled'
    taskType: 'ComputeVmShutdownTask'
    dailyRecurrence: { time: shutdownTime }
    timeZoneId: timeZone
    targetResourceId: vm.id
  }
}

// ---------------------------------------------------------------- Storage + private endpoint (Lab 4A)
resource st 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'stteam${n}lab${substring(uniqueString(resourceGroup().id), 0, 6)}'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    publicNetworkAccess: 'Disabled'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

resource pe 'Microsoft.Network/privateEndpoints@2023-11-01' = {
  name: 'pe-${st.name}-blob'
  location: location
  tags: baseTags
  properties: {
    subnet: { id: '${vnet.id}/subnets/snet-pe' }
    privateLinkServiceConnections: [
      {
        name: 'blob'
        properties: {
          privateLinkServiceId: st.id
          groupIds: ['blob']
        }
      }
    ]
  }
}

resource peDns 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2023-11-01' = {
  parent: pe
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      { name: 'blob', properties: { privateDnsZoneId: privateDnsZoneBlobId } }
    ]
  }
}

// ---------------------------------------------------------------- Action group (Lab 4B)
resource ag 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'ag-training-team${n}'
  location: 'global'
  tags: baseTags
  properties: {
    enabled: true
    groupShortName: 'team${n}'
    emailReceivers: [
      { name: 'email-trainer', emailAddress: alertEmail, useCommonAlertSchema: true }
    ]
  }
}

output vnetId string = vnet.id
output vmPrivateIp string = '${prefix}.4'
output storageAccountName string = st.name
