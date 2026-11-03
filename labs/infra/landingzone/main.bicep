// Spoke per tim di subscription landing zone (di bawah MG Corp).
// Membuat rg-spoke-teamN (VNet, VM aplikasi, storage + private endpoint, action group),
// rg-arc-teamN (kosong, untuk Lab 4B), link DNS ruleset hub ke spoke, dan budget subscription.
// Peering ke hub TIDAK dibuat – dikerjakan peserta di Lab 3B.
targetScope = 'subscription'

param location string = 'indonesiacentral'

@description('Nomor tim, contoh [0, 1, 2, 3]. Tim 0 = golden team trainer.')
param teams array

@description('Subscription ID tempat hub (rg-conn) berada.')
param hubSubscriptionId string

param hubResourceGroup string = 'rg-conn'
param rulesetName string = 'frs-hub'

@description('Resource ID private DNS zone privatelink.blob (output template hub).')
param privateDnsZoneBlobId string

param adminUsername string = 'labadmin'

@secure()
param adminPassword string

@description('Email untuk action group tim dan budget.')
param alertEmail string

param budgetAmount int = 300

@description('Tanggal mulai budget, format YYYY-MM-01.')
param budgetStartDate string

// Sengaja tanpa CostCenter: Lab 2A meminta peserta menemukan resource group tanpa tag ini.
param rgTags object = {
  Environment: 'training'
  Owner: 'platform-team'
}

resource rgSpoke 'Microsoft.Resources/resourceGroups@2024-03-01' = [for n in teams: {
  name: 'rg-spoke-team${n}'
  location: location
  tags: rgTags
}]

resource rgArc 'Microsoft.Resources/resourceGroups@2024-03-01' = [for n in teams: {
  name: 'rg-arc-team${n}'
  location: location
  tags: union(rgTags, { CostCenter: 'CC-TRAINING-0${n}' })
}]

module spoke 'modules/spoke-team.bicep' = [for (n, i) in teams: {
  name: 'spoke-team${n}'
  scope: rgSpoke[i]
  params: {
    teamNumber: n
    location: location
    privateDnsZoneBlobId: privateDnsZoneBlobId
    adminUsername: adminUsername
    adminPassword: adminPassword
    alertEmail: alertEmail
  }
}]

module rulesetLink 'modules/ruleset-link.bicep' = [for (n, i) in teams: {
  name: 'frs-link-team${n}'
  scope: resourceGroup(hubSubscriptionId, hubResourceGroup)
  params: {
    rulesetName: rulesetName
    linkName: 'link-vnet-spoke-team${n}'
    vnetId: spoke[i].outputs.vnetId
  }
}]

// Budget subscription (Lab 1 pertanyaan 8)
resource budget 'Microsoft.Consumption/budgets@2023-11-01' = {
  name: 'budget-training-landingzone'
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: { startDate: budgetStartDate }
    notifications: {
      actual80: {
        enabled: true
        operator: 'GreaterThanOrEqualTo'
        threshold: 80
        thresholdType: 'Actual'
        contactEmails: [alertEmail]
      }
      actual100: {
        enabled: true
        operator: 'GreaterThanOrEqualTo'
        threshold: 100
        thresholdType: 'Actual'
        contactEmails: [alertEmail]
      }
    }
  }
}

output spokes array = [for (n, i) in teams: {
  team: n
  vnetId: spoke[i].outputs.vnetId
  vmPrivateIp: spoke[i].outputs.vmPrivateIp
  storageAccountName: spoke[i].outputs.storageAccountName
}]
