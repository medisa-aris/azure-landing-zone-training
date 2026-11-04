// Link DNS forwarding ruleset hub ke VNet spoke (dideploy di rg-conn, subscription Connectivity).
targetScope = 'resourceGroup'

param rulesetName string
param linkName string
param vnetId string

resource ruleset 'Microsoft.Network/dnsForwardingRulesets@2022-07-01' existing = {
  name: rulesetName
}

resource link 'Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks@2022-07-01' = {
  parent: ruleset
  name: linkName
  properties: { virtualNetwork: { id: vnetId } }
}
