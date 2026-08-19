param(
  [Parameter(Mandatory = $true)]
  [string]$DatabaseUrl,
  [string]$Location = "brazilsouth",
  [string]$ResourceGroup = "rg-fitpulse-staging",
  [string]$ContainerAppName = "ca-fitpulse-api",
  [string]$ContainerEnvName = "cae-fitpulse-staging",
  [string]$FrontendOrigin = "https://red-mushroom-0d8b1010f.7.azurestaticapps.net",
  [string]$Image = "ghcr.io/lucaspasin/fitpulse-api:latest"
)

$ErrorActionPreference = "Stop"

Write-Host "Azure footprint (no paid database):"
Write-Host "  - Static Web Apps Free (existing frontend)"
Write-Host "  - Container Apps Consumption, min replicas = 0 (API)"
Write-Host "  - Postgres from Neon Free (DATABASE_URL you pass in)"
Write-Host ""

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  throw "Azure CLI (az) is required. Install: winget install Microsoft.AzureCLI"
}

az account show | Out-Null

if ($DatabaseUrl -notmatch '^postgres(ql)?://') {
  throw "DatabaseUrl must be a postgres connection string from Neon (Dashboard -> Connect)."
}

if ($DatabaseUrl -notmatch 'sslmode=') {
  $sep = '&'
  if (-not $DatabaseUrl.Contains('?')) { $sep = '?' }
  $DatabaseUrl = "$DatabaseUrl${sep}sslmode=require"
}
if ($DatabaseUrl -notmatch 'connect_timeout=') {
  $sep = '&'
  if (-not $DatabaseUrl.Contains('?')) { $sep = '?' }
  $DatabaseUrl = "$DatabaseUrl${sep}connect_timeout=30"
}

$jwtSecret = -join ((1..48) | ForEach-Object { Get-Random -InputObject ([char[]]((48..57) + (65..90) + (97..122))) })

Write-Host "Creating resource group $ResourceGroup in $Location..."
az group create --name $ResourceGroup --location $Location | Out-Null

Write-Host "Creating Container Apps environment (Consumption)..."
az containerapp env create `
  --name $ContainerEnvName `
  --resource-group $ResourceGroup `
  --location $Location | Out-Null

Write-Host "Creating Container App (min replicas 0)..."
az containerapp create `
  --name $ContainerAppName `
  --resource-group $ResourceGroup `
  --environment $ContainerEnvName `
  --image $Image `
  --target-port 4000 `
  --ingress external `
  --min-replicas 0 `
  --max-replicas 3 `
  --cpu 0.25 `
  --memory 0.5Gi `
  --secrets "database-url=$DatabaseUrl" "jwt-secret=$jwtSecret" `
  --env-vars `
    "NODE_ENV=production" `
    "PORT=4000" `
    "SEED_ON_START=true" `
    "FRONTEND_ORIGIN=$FrontendOrigin" `
    "DATABASE_URL=secretref:database-url" `
    "JWT_SECRET=secretref:jwt-secret"

$apiFqdn = az containerapp show --name $ContainerAppName --resource-group $ResourceGroup --query properties.configuration.ingress.fqdn -o tsv
$apiUrl = "https://$apiFqdn"

Write-Host ""
Write-Host "Provisioning finished."
Write-Host "API URL: $apiUrl"
Write-Host ""
Write-Host "GitHub secrets / variables to set:"
Write-Host "  secret VITE_API_URL = $apiUrl"
Write-Host "  secret AZURE_CREDENTIALS = (az ad sp create-for-rbac output)"
Write-Host "  variable AZURE_RESOURCE_GROUP = $ResourceGroup"
Write-Host "  variable AZURE_CONTAINER_APP = $ContainerAppName"
Write-Host ""
Write-Host "Create a deploy service principal:"
Write-Host "  az ad sp create-for-rbac --name fitpulse-github --role contributor --scopes /subscriptions/<sub>/resourceGroups/$ResourceGroup --sdk-auth"
Write-Host ""
Write-Host "JWT_SECRET was generated on the Container App. It is not written to git."
