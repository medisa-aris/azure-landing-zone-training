// Lab 5A – isi nilai di bawah sesuai Lab Guide, lalu buka pull request.
// Salin folder ini untuk setiap tim (teams/team2, teams/team3, ...).
using '../../modules/spoke/main.bicep'

param teamName = 'team1'
param spokeName = 'spoke2'
param location = 'indonesiacentral'
param addressPrefix = '10.0.21.0/24'
param tags = {
  CostCenter: 'CC-ISI-COSTCENTER'
  Owner: 'userNN@tenant.onmicrosoft.com'
  Environment: 'training'
}
