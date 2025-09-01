# Supabase CLI via Docker - PowerShell script

Write-Host "Running Supabase CLI via Docker..." -ForegroundColor Green

docker run --rm `
  -v "${PWD}:/workspace" `
  -w /workspace `
  -p 54321:54321 `
  -p 54322:54322 `
  -p 54323:54323 `
  -p 54324:54324 `
  -p 54325:54325 `
  -p 54326:54326 `
  -p 54327:54327 `
  supabase/cli:latest `
  $args

Write-Host "Supabase command completed." -ForegroundColor Green