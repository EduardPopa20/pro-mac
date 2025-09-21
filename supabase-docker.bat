@echo off
REM Supabase CLI via Docker - Windows batch script

echo Running Supabase CLI via Docker...
docker run --rm ^
  -v "%cd%":/workspace ^
  -w /workspace ^
  -p 54321:54321 ^
  -p 54322:54322 ^
  -p 54323:54323 ^
  -p 54324:54324 ^
  -p 54325:54325 ^
  -p 54326:54326 ^
  -p 54327:54327 ^
  supabase/cli:latest ^
  %*