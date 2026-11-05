targetScope = 'subscription'

@description('Environment name from the approved deployment plan.')
param environmentName string

@description('Azure region for the Static Web App and resource group.')
param location string

@description('Deployment session identifier.')
param sessionId string

@description('Identity label of the deployment requester.')
param deployedBy string

@description('UTC timestamp when this infrastructure definition was generated.')
param createdAt string

@description('Resource group name from the approved deployment plan.')
param resourceGroupName string

@description('Static Web App name from the approved deployment plan.')
param staticWebAppName string

var commonTags = {
  'app-onboard-skill': 'true'
  'app-onboard-session-id': sessionId
  'created-at': createdAt
  environment: environmentName
  'deployed-by': deployedBy
}

resource resourceGroup 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: resourceGroupName
  location: location
  tags: commonTags
}

module staticWebApp 'modules/static-web-app.bicep' = {
  name: 'static-web-app'
  scope: resourceGroup
  params: {
    location: location
    resourceName: staticWebAppName
    tags: commonTags
  }
}
