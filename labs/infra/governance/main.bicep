// Policy lab di management group Landing Zones:
// - Allowed locations (Deny)                    -> Lab 1 (pertanyaan 6), Demo D2, game day inject 3
// - Audit tag wajib pada resource               -> Lab 1 (pertanyaan 7), Lab 2A, Lab 2B
// Jalankan di scope management group:
//   az deployment mg create --management-group-id <MG_LANDINGZONES> -l indonesiacentral -f main.bicep -p ...
targetScope = 'managementGroup'

param allowedLocations array = ['indonesiacentral']

param requiredTags array = ['CostCenter', 'Owner', 'Environment']

// Built-in: Allowed locations (mengecualikan resource berlokasi 'global')
var allowedLocationsDefinitionId = tenantResourceId('Microsoft.Authorization/policyDefinitions', 'e56962a6-4747-49cd-b67b-bf8b01975c4c')

resource assignAllowedLocations 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'lab-allowed-locations'
  properties: {
    displayName: 'Allowed locations (training: Indonesia Central)'
    policyDefinitionId: allowedLocationsDefinitionId
    enforcementMode: 'Default'
    parameters: {
      listOfAllowedLocations: { value: allowedLocations }
    }
    nonComplianceMessages: [
      { message: 'Region tidak diizinkan. Gunakan Indonesia Central atau ajukan policy exemption.' }
    ]
  }
}

resource auditTagDefinition 'Microsoft.Authorization/policyDefinitions@2023-04-01' = {
  name: 'lab-audit-required-tag'
  properties: {
    displayName: 'Audit tag wajib pada resource (training)'
    policyType: 'Custom'
    mode: 'Indexed'
    parameters: {
      tagName: { type: 'String', metadata: { displayName: 'Tag name' } }
    }
    policyRule: {
      if: { field: '[concat(\'tags[\', parameters(\'tagName\'), \']\')]', exists: 'false' }
      then: { effect: 'audit' }
    }
  }
}

resource assignAuditTags 'Microsoft.Authorization/policyAssignments@2024-04-01' = [for t in requiredTags: {
  name: take('lab-audit-tag-${toLower(t)}', 24)
  properties: {
    displayName: 'Tag wajib: ${t} (audit)'
    policyDefinitionId: auditTagDefinition.id
    parameters: {
      tagName: { value: t }
    }
  }
}]
