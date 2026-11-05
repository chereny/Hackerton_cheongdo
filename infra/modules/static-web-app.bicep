@description('The approved Azure region for the Static Web App.')
param location string

@description('Static Web App name from the approved deployment plan.')
param resourceName string

@description('Common deployment metadata tags.')
param tags object

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: resourceName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}
